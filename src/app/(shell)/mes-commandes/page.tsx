"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { LIBELLE_STATUT_COMMANDE, STYLE_STATUT_COMMANDE, type Commande, type Pagination } from "@/lib/types";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export default function MesCommandesPage() {
  const { token, pret } = useAuth();
  const [commandes, setCommandes] = useState<Commande[] | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pagination<Commande>>("/commandes", { token }).then((page) => setCommandes(page.data));
  }, [token]);

  return (
    <main className="min-h-full pb-6">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-brand-ink">Mes commandes</h1>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-4">
        {!pret || (token && commandes === null) ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Chargement…</p>
        ) : !token ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Connectez-vous pour voir vos commandes.</p>
        ) : commandes?.length === 0 ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Vous n&apos;avez pas encore de commande.</p>
        ) : (
          commandes?.map((commande) => {
            const premiereLigne = commande.lignes[0];
            const autresArticles = commande.lignes.length - 1;

            return (
              <Link
                key={commande.id}
                href={`/mes-commandes/${commande.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  {premiereLigne ? <ImageProduitCard images={premiereLigne.produit.images} nom={premiereLigne.produit.nom_produit} sizes="64px" /> : null}
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
              </Link>
            );
          })
        )}
      </div>
    </main>
  );
}
