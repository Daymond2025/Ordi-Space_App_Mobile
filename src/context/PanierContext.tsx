"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "@/lib/api";
import type { Panier } from "@/lib/types";

type PanierContextValue = {
  panier: Panier | null;
  nombreArticles: number;
  rafraichir: () => Promise<void>;
  ajouter: (produitId: number, quantite?: number) => Promise<void>;
  modifierQuantite: (ligneId: number, quantite: number) => Promise<void>;
  retirer: (ligneId: number) => Promise<void>;
  vider: () => Promise<void>;
};

const PanierContext = createContext<PanierContextValue | null>(null);

export function PanierProvider({ children }: { children: ReactNode }) {
  const { token, pret } = useAuth();
  const [panier, setPanier] = useState<Panier | null>(null);

  const rafraichir = useCallback(async () => {
    if (!token) {
      setPanier(null);
      return;
    }
    const donnees = await apiFetch<Panier>("/moi/panier", { token });
    setPanier(donnees);
  }, [token]);

  useEffect(() => {
    if (!pret) return;
    rafraichir();
  }, [pret, rafraichir]);

  async function ajouter(produitId: number, quantite = 1) {
    if (!token) return;
    const donnees = await apiFetch<Panier>("/moi/panier/lignes", {
      method: "POST",
      token,
      body: { produit_id: produitId, quantite },
    });
    setPanier(donnees);
  }

  async function modifierQuantite(ligneId: number, quantite: number) {
    if (!token) return;
    const donnees = await apiFetch<Panier>(`/moi/panier/lignes/${ligneId}`, {
      method: "PUT",
      token,
      body: { quantite },
    });
    setPanier(donnees);
  }

  async function retirer(ligneId: number) {
    if (!token) return;
    const donnees = await apiFetch<Panier>(`/moi/panier/lignes/${ligneId}`, { method: "DELETE", token });
    setPanier(donnees);
  }

  async function vider() {
    if (!token) return;
    await apiFetch("/moi/panier", { method: "DELETE", token });
    setPanier((p) => (p ? { ...p, lignes: [] } : p));
  }

  const nombreArticles = panier?.lignes.reduce((total, ligne) => total + ligne.quantite, 0) ?? 0;

  return (
    <PanierContext.Provider value={{ panier, nombreArticles, rafraichir, ajouter, modifierQuantite, retirer, vider }}>
      {children}
    </PanierContext.Provider>
  );
}

export function usePanier(): PanierContextValue {
  const contexte = useContext(PanierContext);

  if (!contexte) {
    throw new Error("usePanier doit être utilisé sous PanierProvider");
  }

  return contexte;
}
