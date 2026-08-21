"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formaterDate, garantieEstActive, type Achat, type Pagination } from "@/lib/types";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { ChevronLeftIcon, ChevronRightIcon, ShieldCheckIcon } from "@/components/icons";

export default function MesAchatsPage() {
  const { token, pret } = useAuth();
  const [achats, setAchats] = useState<Achat[] | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pagination<Achat>>("/moi/achats", { token }).then((page) => setAchats(page.data));
  }, [token]);

  return (
    <main className="min-h-full pb-6">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-brand-ink">Mes achats</h1>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-4">
        {!pret || (token && achats === null) ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Chargement…</p>
        ) : !token ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Connectez-vous pour voir vos achats.</p>
        ) : achats?.length === 0 ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Vous n&apos;avez pas encore d&apos;ordinateur enregistré.</p>
        ) : (
          achats?.map((achat) => {
            const active = garantieEstActive(achat.garantie);

            return (
              <Link
                key={achat.id}
                href={`/mes-achats/${achat.id}`}
                className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm"
              >
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
                  <ImageProduitCard images={achat.produit.images} nom={achat.produit.nom_produit} sizes="64px" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-brand-ink">{achat.produit.nom_produit}</p>
                  <p className="mt-0.5 truncate text-xs text-brand-muted">
                    Acheté le {formaterDate(achat.commande.date_commande)}
                  </p>
                  <span
                    className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-semibold ${
                      active ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                    }`}
                  >
                    <ShieldCheckIcon className="h-3 w-3" />
                    {active ? "Garantie en cours" : "Garantie expirée"}
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
