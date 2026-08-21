"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import {
  formaterDateHeure,
  LIBELLE_STATUT_COMMANDE,
  STYLE_STATUT_COMMANDE,
  type Commande,
} from "@/lib/types";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { ChevronLeftIcon, ChevronRightIcon, PlayIcon } from "@/components/icons";

type Etape = {
  label: string;
  dateIso: string | null;
  atteinte: boolean;
  couleurTexte: string;
};

function construireEtapes(commande: Commande): Etape[] {
  const etapes: Etape[] = [
    {
      label: "Commande passée",
      dateIso: commande.date_commande,
      atteinte: true,
      couleurTexte: "text-brand-ink",
    },
    {
      label: "Commande en attente de validation",
      dateIso: commande.date_commande,
      atteinte: true,
      couleurTexte: "text-pink-600",
    },
  ];

  if (commande.statut_commande === "annulee") {
    etapes.push({
      label: "Commande annulée",
      dateIso: null,
      atteinte: true,
      couleurTexte: "text-rose-500",
    });
    return etapes;
  }

  if (commande.livraison) {
    etapes.push({
      label: "Livraison en cours",
      dateIso: commande.livraison.date_prise_en_charge,
      atteinte: commande.livraison.date_prise_en_charge !== null,
      couleurTexte: "text-[color:var(--brand-blue-end)]",
    });
  }

  const livree = commande.statut_commande === "livree";
  etapes.push({
    label: commande.livraison ? "Commande livrée" : "Commande disponible",
    dateIso: commande.livraison?.date_livraison_effective ?? (livree ? commande.date_validation : null),
    atteinte: livree,
    couleurTexte: "text-brand-ink",
  });

  etapes.push({
    label: "Paiement effectué",
    dateIso: commande.paiement?.date_paiement ?? null,
    atteinte: commande.paiement !== null,
    couleurTexte: "text-brand-ink",
  });

  return etapes;
}

export function SuiviCommande({ id }: { id: string }) {
  const { token, pret } = useAuth();
  const [commande, setCommande] = useState<Commande | null | undefined>(undefined);

  useEffect(() => {
    if (!token) return;
    apiFetch<Commande>(`/commandes/${id}`, { token })
      .then(setCommande)
      .catch(() => setCommande(null));
  }, [id, token]);

  if (!pret || (token && commande === undefined)) {
    return <p className="px-4 py-6 text-sm text-brand-muted">Chargement…</p>;
  }

  if (!token || !commande) {
    return (
      <main className="min-h-full">
        <div className="flex items-center gap-3 px-4 pt-4">
          <Link href="/mes-commandes" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold text-brand-ink">Mes commandes</h1>
        </div>
        <p className="px-4 pt-6 text-sm text-brand-muted">Cette commande est introuvable.</p>
      </main>
    );
  }

  const premiereLigne = commande.lignes[0];
  const autresArticles = commande.lignes.length - 1;
  const etapes = construireEtapes(commande);

  return (
    <main className="min-h-full pb-8">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/mes-commandes" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-brand-ink">Mes commandes</h1>
      </div>

      <div className="mt-4 flex items-center gap-3 px-4">
        <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white p-3 shadow-sm">
          <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
            {premiereLigne ? (
              <ImageProduitCard images={premiereLigne.produit.images} nom={premiereLigne.produit.nom_produit} sizes="64px" />
            ) : null}
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-brand-ink">
              {premiereLigne?.produit.nom_produit}
              {autresArticles > 0 ? ` +${autresArticles} autre${autresArticles > 1 ? "s" : ""}` : ""}
            </p>
            <p className="mt-0.5 truncate text-xs text-brand-muted">
              {premiereLigne?.produit.description ?? premiereLigne?.produit.categorie.nom_categorie}
            </p>
            <span className={`mt-2 inline-block rounded-full px-3 py-1 text-[11px] font-semibold ${STYLE_STATUT_COMMANDE[commande.statut_commande]}`}>
              {LIBELLE_STATUT_COMMANDE[commande.statut_commande]}
            </span>
          </div>

          <ChevronRightIcon className="h-4 w-4 shrink-0 text-brand-muted" />
        </div>
      </div>

      <section className="mt-5 rounded-t-[2rem] bg-white px-5 pb-8 pt-6 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <h2 className="text-center text-base font-bold text-brand-ink">Suivi de la commande</h2>
        <hr className="mx-auto mt-3 w-24 border-brand-line" />

        <ol className="mt-6 flex flex-col">
          {etapes.map((etape, index) => {
            const estDerniere = index === etapes.length - 1;

            return (
              <li key={etape.label} className="flex items-start gap-3">
                <PlayIcon className={`mt-0.5 h-5 w-5 shrink-0 ${etape.atteinte ? "text-brand-muted/70" : "text-brand-muted/30"}`} />

                <div className="flex flex-col items-center">
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${etape.atteinte ? "bg-[color:var(--brand-blue-end)]" : "bg-brand-line"}`} />
                  {!estDerniere ? <span className={`w-0.5 flex-1 ${etape.atteinte ? "bg-[color:var(--brand-blue-end)]" : "bg-brand-line"}`} style={{ minHeight: "2.75rem" }} /> : null}
                </div>

                <div className={`${estDerniere ? "" : "pb-6"}`}>
                  <p className={`text-sm font-bold ${etape.couleurTexte}`}>{etape.label}</p>
                  <p className="mt-0.5 text-xs text-brand-muted">
                    {etape.dateIso ? formaterDateHeure(etape.dateIso) : etape.atteinte ? "" : "En attente"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </section>
    </main>
  );
}
