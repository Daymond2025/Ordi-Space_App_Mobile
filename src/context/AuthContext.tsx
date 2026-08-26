"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch } from "@/lib/api";

export type Utilisateur = {
  id: number;
  nom: string;
  prenom: string | null;
  email: string | null;
  type_utilisateur: string;
  roles: string[];
  permissions: string[];
};

type SessionResult = { user: Utilisateur; token: string };

type DemandeOtpResultat = { compteExistant: boolean; userId?: number; codeDebug?: string };
type InscriptionResultat = { userId: number; codeDebug?: string };

type AuthContextValue = {
  user: Utilisateur | null;
  token: string | null;
  pret: boolean;
  demanderOtp: (telephone: string) => Promise<DemandeOtpResultat>;
  inscrireParTelephone: (telephone: string, nom: string, prenom?: string) => Promise<InscriptionResultat>;
  verifierOtp: (userId: number, code: string) => Promise<void>;
  logout: () => Promise<void>;
};

const STOCKAGE_CLE = "ordispace.session";
const NOM_APPAREIL = "app-mobile-web";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Utilisateur | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [pret, setPret] = useState(false);

  useEffect(() => {
    const brut = localStorage.getItem(STOCKAGE_CLE);
    if (brut) {
      try {
        const session = JSON.parse(brut) as SessionResult;
        setUser(session.user);
        setToken(session.token);
      } catch {
        localStorage.removeItem(STOCKAGE_CLE);
      }
    }
    setPret(true);
  }, []);

  function memoriser(session: SessionResult) {
    setUser(session.user);
    setToken(session.token);
    localStorage.setItem(STOCKAGE_CLE, JSON.stringify(session));
  }

  async function demanderOtp(telephone: string): Promise<DemandeOtpResultat> {
    const reponse = await apiFetch<{ compte_existant: boolean; user_id?: number; code_debug?: string }>(
      "/auth/telephone/otp",
      { method: "POST", body: { telephone } }
    );

    return { compteExistant: reponse.compte_existant, userId: reponse.user_id, codeDebug: reponse.code_debug };
  }

  async function inscrireParTelephone(telephone: string, nom: string, prenom?: string): Promise<InscriptionResultat> {
    const reponse = await apiFetch<{ user_id: number; code_debug?: string }>("/auth/telephone/inscription", {
      method: "POST",
      body: { telephone, nom, prenom },
    });

    return { userId: reponse.user_id, codeDebug: reponse.code_debug };
  }

  async function verifierOtp(userId: number, code: string) {
    const reponse = await apiFetch<SessionResult>("/auth/verify-otp", {
      method: "POST",
      body: { user_id: userId, code, device_name: NOM_APPAREIL },
    });

    memoriser(reponse);
  }

  async function logout() {
    if (token) {
      await apiFetch("/auth/logout", { method: "POST", token }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem(STOCKAGE_CLE);
  }

  return (
    <AuthContext.Provider value={{ user, token, pret, demanderOtp, inscrireParTelephone, verifierOtp, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé sous <AuthProvider>.");
  return context;
}
