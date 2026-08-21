"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { Achat, Pagination } from "@/lib/types";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { EnTetePanne } from "./EnTetePanne";

export default function DeclarerPannePage() {
  const router = useRouter();
  const { token, pret } = useAuth();
  const [achats, setAchats] = useState<Achat[] | null>(null);
  const [achatSelectionneId, setAchatSelectionneId] = useState<number | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pagination<Achat>>("/moi/achats", { token }).then((page) => setAchats(page.data));
  }, [token]);

  function continuer() {
    if (!achatSelectionneId) return;
    router.push(`/service/declarer-panne/description?achat=${achatSelectionneId}`);
  }

  return (
    <main className="min-h-full pb-8">
      <EnTetePanne />

      <div className="relative -mt-12 rounded-t-[2rem] bg-white px-5 pb-4 pt-5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <h2 className="text-center text-base font-bold text-brand-ink">Sélectionner le produit concerné</h2>
      </div>

      <div className="flex flex-col gap-3 px-5 pt-4">
        {!pret || (token && achats === null) ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Chargement…</p>
        ) : !token ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Connectez-vous pour déclarer une panne.</p>
        ) : achats?.length === 0 ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Vous n&apos;avez pas encore d&apos;ordinateur enregistré.</p>
        ) : (
          achats?.map((achat) => (
            <button
              key={achat.id}
              type="button"
              onClick={() => setAchatSelectionneId(achat.id)}
              className={`flex items-center gap-3 rounded-2xl border px-3 py-3 text-left transition-colors ${
                achatSelectionneId === achat.id ? "border-[color:var(--brand-blue-end)] bg-blue-50" : "border-brand-line bg-white"
              }`}
            >
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl">
                <ImageProduitCard images={achat.produit.images} nom={achat.produit.nom_produit} sizes="56px" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-brand-ink">{achat.produit.nom_produit}</p>
                <p className="mt-0.5 truncate text-xs text-brand-muted">
                  {achat.produit.description ?? achat.produit.categorie.nom_categorie}
                </p>
              </div>
              <span
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 ${
                  achatSelectionneId === achat.id ? "border-[color:var(--brand-blue-end)] bg-[color:var(--brand-blue-end)]" : "border-brand-line"
                }`}
              >
                {achatSelectionneId === achat.id ? <span className="h-2 w-2 rounded-full bg-white" /> : null}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="mt-6 px-5">
        <button
          type="button"
          onClick={continuer}
          disabled={!achatSelectionneId}
          className="bg-gradient-brand-blue flex h-12 w-full items-center justify-center rounded-full text-sm font-bold text-white shadow-md shadow-blue-200 transition-opacity disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </main>
  );
}
