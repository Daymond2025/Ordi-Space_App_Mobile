"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { apiFetch, ApiRequestError } from "@/lib/api";

export type Utilisateur = {
  id: number;
  nom: string;
  prenom: string | null;
  email: string;
  type_utilisateur: string;
  roles: string[];
  permissions: string[];
};

type SessionResult = { user: Utilisateur; token: string };

type RegisterPayload = {
  nom: string;
  prenom?: string;
  email: string;
  telephone?: string;
  password: string;
  password_confirmation: string;
};

type AuthContextValue = {
  user: Utilisateur | null;
  token: string | null;
  pret: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
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

  async function login(email: string, password: string) {
    const reponse = await apiFetch<SessionResult | { requires_2fa: true; user_id: number }>(
      "/auth/login",
      { method: "POST", body: { email, password, device_name: NOM_APPAREIL } }
    );

    if ("requires_2fa" in reponse) {
      // N'arrive jamais pour un compte Client — réservé à Coordinateur/Admin,
      // qui utilisent une autre application.
      throw new ApiRequestError(
        {
          code: "COMPTE_NON_SUPPORTE",
          message: "Ce compte nécessite une vérification supplémentaire non disponible ici.",
        },
        403
      );
    }

    memoriser(reponse);
  }

  async function register(payload: RegisterPayload) {
    const reponse = await apiFetch<SessionResult>("/auth/register", {
      method: "POST",
      body: { ...payload, type_utilisateur: "client" },
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
    <AuthContext.Provider value={{ user, token, pret, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth doit être utilisé sous <AuthProvider>.");
  return context;
}
