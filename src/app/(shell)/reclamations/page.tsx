"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formaterDate, LIBELLE_STATUT_RECLAMATION, STYLE_STATUT_RECLAMATION, type Pagination, type Reclamation } from "@/lib/types";
import { ChevronLeftIcon, PlusIcon, TicketIcon } from "@/components/icons";

export default function ReclamationsPage() {
  const { token, pret } = useAuth();
  const [reclamations, setReclamations] = useState<Reclamation[] | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pagination<Reclamation>>("/reclamations", { token }).then((page) => setReclamations(page.data));
  }, [token]);

  return (
    <main className="min-h-full pb-6">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 text-base font-bold text-brand-ink">Mes réclamations</h1>
        <Link href="/reclamations/nouvelle" className="bg-gradient-brand-blue flex h-9 w-9 items-center justify-center rounded-full text-white">
          <PlusIcon className="h-4 w-4" />
        </Link>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-4">
        {!pret || (token && reclamations === null) ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Chargement…</p>
        ) : !token ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Connectez-vous pour voir vos réclamations.</p>
        ) : reclamations?.length === 0 ? (
          <div className="flex flex-col items-center gap-3 pt-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F2F6] text-brand-muted">
              <TicketIcon className="h-6 w-6" />
            </span>
            <p className="text-sm text-brand-muted">Vous n&apos;avez déposé aucune réclamation.</p>
            <Link href="/reclamations/nouvelle" className="bg-gradient-brand-blue rounded-full px-5 py-2.5 text-sm font-semibold text-white">
              Déposer une réclamation
            </Link>
          </div>
        ) : (
          reclamations?.map((r) => (
            <div key={r.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold text-brand-ink">{r.sujet}</p>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[11px] font-semibold ${STYLE_STATUT_RECLAMATION[r.statut]}`}>
                  {LIBELLE_STATUT_RECLAMATION[r.statut]}
                </span>
              </div>
              <p className="mt-1 text-xs text-brand-muted">{formaterDate(r.date_reclamation)}</p>
              <p className="mt-2 line-clamp-2 text-sm text-brand-ink">{r.description}</p>
              {r.reponse_admin ? (
                <div className="mt-3 rounded-xl bg-[#F1F2F6] p-3 text-xs text-brand-ink">
                  <p className="font-semibold text-brand-muted">Réponse d&apos;Ordi&apos;Space</p>
                  <p className="mt-1">{r.reponse_admin}</p>
                </div>
              ) : null}
            </div>
          ))
        )}
      </div>
    </main>
  );
}
