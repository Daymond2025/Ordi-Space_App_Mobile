"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formaterPrix, type Achat, type Pagination } from "@/lib/types";
import { CheckCircleIcon } from "@/components/icons";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { EnTeteApresVente } from "./EnTeteApresVente";

const DEGRADE_CONTINUER = "linear-gradient(90deg, #0077FF 0%, #00BFFF 100%)";

// useSearchParams() exige un <Suspense> autour de tout ce qui l'utilise,
// sinon le build échoue au prerendering (cf. market-space/page.tsx, même
// pattern déjà établi dans ce projet).
export default function SelectionProduitApresVentePage() {
  return (
    <Suspense>
      <SelectionProduitApresVenteContenu />
    </Suspense>
  );
}

function SelectionProduitApresVenteContenu() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token, pret } = useAuth();
  const [achats, setAchats] = useState<Achat[] | null>(null);
  const [achatId, setAchatId] = useState<number | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pagination<Achat>>("/moi/achats", { token }).then((page) => {
      setAchats(page.data);
      // Liste à choix explicite (contrairement à un <select>, rien n'est
      // "déjà sélectionné" par défaut) — seul un id revenant de l'URL
      // pré-sélectionne un produit.
      const depuisUrl = Number(searchParams.get("achat"));
      setAchatId(page.data.find((a) => a.id === depuisUrl)?.id ?? null);
    });
  }, [token, searchParams]);

  function continuer() {
    if (!achatId) {
      setErreur("Sélectionnez un produit avant de continuer.");
      return;
    }
    setErreur(null);
    router.push(`/service/apres-vente/nouvelle-demande/preoccupations?achat=${achatId}`);
  }

  return (
    <main className="min-h-full pb-10">
      <EnTeteApresVente />

      <div className="relative -mt-12 rounded-t-[2rem] bg-white px-5 pb-4 pt-5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <h2 className="text-center text-base font-bold leading-snug text-brand-ink">Sélectionner le produit concerné</h2>
      </div>

      <div className="flex flex-col gap-4 px-5 pt-6">
        {!pret || (token && achats === null) ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Chargement…</p>
        ) : achats?.length === 0 ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Vous n&apos;avez encore aucun achat éligible au service après-vente.</p>
        ) : (
          <>
            <div className="flex flex-col gap-3">
              {achats?.map((achat) => {
                const selectionne = achat.id === achatId;
                return (
                  <button
                    key={achat.id}
                    type="button"
                    onClick={() => setAchatId(achat.id)}
                    className={`flex items-center gap-3 rounded-2xl border-2 bg-white p-3 text-left transition-colors ${
                      selectionne ? "border-[color:var(--brand-blue-end)]" : "border-transparent shadow-sm"
                    }`}
                  >
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                      <ImageProduitCard images={achat.produit.images} nom={achat.produit.nom_produit} sizes="64px" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-bold text-brand-ink">{achat.produit.nom_produit}</p>
                      <p className="mt-0.5 text-sm font-bold text-[color:var(--brand-blue-end)]">{formaterPrix(achat.produit.prix)} FCFA</p>
                    </div>

                    <span
                      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${
                        selectionne ? "bg-[color:var(--brand-blue-end)] text-white" : "bg-[#EEF1F6] text-transparent"
                      }`}
                    >
                      <CheckCircleIcon className="h-4 w-4" />
                    </span>
                  </button>
                );
              })}
            </div>

            {erreur ? <p className="text-center text-sm text-rose-500">{erreur}</p> : null}

            <div className="mt-2 flex justify-center">
              <button
                type="button"
                onClick={continuer}
                className="flex h-[53px] w-[296px] items-center justify-center rounded-[26.5px] border-[3px] border-white/40 text-sm font-bold text-white shadow-md shadow-blue-200"
                style={{ backgroundImage: DEGRADE_CONTINUER }}
              >
                Continue
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
