"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formaterDate, LIBELLE_STATUT_RECLAMATION, STYLE_STATUT_RECLAMATION, type Pagination, type Reclamation, type StatutReclamation } from "@/lib/types";
import { CalendarIcon, ChevronLeftIcon, DotsVerticalIcon, TicketIcon } from "@/components/icons";
import { DEGRADE_HEADER_RECLAMATION, OMBRE_HEADER_RECLAMATION } from "./degrade";
import { TiroirNouvelleReclamation } from "./TiroirNouvelleReclamation";

const FILTRES: { valeur: StatutReclamation | null; label: string }[] = [
  { valeur: null, label: "Toutes" },
  { valeur: "nouvelle", label: "En attente" },
  { valeur: "en_cours", label: "En cours" },
  { valeur: "resolue", label: "Terminé" },
  { valeur: "rejetee", label: "Rejetée" },
  { valeur: "annulee", label: "Annulée" },
];

function reference(id: number): string {
  return `REC-${String(id).padStart(4, "0")}`;
}

export default function ReclamationsPage() {
  const { token, pret } = useAuth();
  const [reclamations, setReclamations] = useState<Reclamation[] | null>(null);
  const [filtre, setFiltre] = useState<StatutReclamation | null>(null);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [tiroirOuvert, setTiroirOuvert] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  function recharger() {
    if (!token) return;
    const qs = filtre ? `?statut=${filtre}` : "";
    apiFetch<Pagination<Reclamation>>(`/reclamations${qs}`, { token }).then((page) => setReclamations(page.data));
  }

  useEffect(() => {
    recharger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, filtre]);

  useEffect(() => {
    if (!menuOuvert) return;
    function fermerSiExterieur(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOuvert(false);
    }
    document.addEventListener("mousedown", fermerSiExterieur);
    return () => document.removeEventListener("mousedown", fermerSiExterieur);
  }, [menuOuvert]);

  return (
    <main className="min-h-full pb-28">
      <div
        className="relative flex items-center gap-3 rounded-b-[2rem] px-4 pb-5 pt-4"
        style={{ backgroundImage: DEGRADE_HEADER_RECLAMATION, boxShadow: OMBRE_HEADER_RECLAMATION }}
      >
        <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <ChevronLeftIcon className="h-5 w-5 text-white" />
        </Link>
        <h1 className="flex-1 text-base font-bold text-white">Mes réclamations</h1>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOuvert((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20"
            aria-label="Filtrer"
          >
            <DotsVerticalIcon className="h-5 w-5 text-white" />
          </button>

          {menuOuvert ? (
            <div className="absolute right-0 top-11 z-10 w-44 rounded-2xl bg-white p-1.5 shadow-lg">
              {FILTRES.map((f) => (
                <button
                  key={f.label}
                  type="button"
                  onClick={() => {
                    setFiltre(f.valeur);
                    setMenuOuvert(false);
                  }}
                  className={`flex w-full items-center rounded-xl px-3 py-2 text-left text-xs font-semibold ${
                    filtre === f.valeur ? "bg-blue-50 text-[color:var(--brand-blue-end)]" : "text-brand-ink"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
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
            <p className="text-sm text-brand-muted">
              {filtre ? "Aucune réclamation dans cette catégorie." : "Vous n'avez déposé aucune réclamation."}
            </p>
          </div>
        ) : (
          reclamations?.map((r) => (
            <Link key={r.id} href={`/reclamations/${r.id}`} className="flex items-start gap-3 rounded-[20px] bg-white p-4 shadow-sm">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[color:var(--brand-blue-end)]">
                <TicketIcon className="h-5 w-5" />
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2">
                  <p className="line-clamp-2 text-sm font-bold text-brand-ink">{r.sujet}</p>
                  <span className={`shrink-0 whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${STYLE_STATUT_RECLAMATION[r.statut]}`}>
                    {LIBELLE_STATUT_RECLAMATION[r.statut]}
                  </span>
                </div>
                <p className="mt-1 line-clamp-1 text-xs text-brand-muted">{r.description}</p>

                <div className="mt-2 flex items-center gap-2 border-t border-brand-line pt-2 text-[11px] text-brand-muted">
                  <CalendarIcon className="h-3.5 w-3.5" />
                  <span>{formaterDate(r.date_reclamation)}</span>
                  <span className="text-brand-line">|</span>
                  <span>#{reference(r.id)}</span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 mx-auto max-w-xl px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3">
        <button
          type="button"
          onClick={() => setTiroirOuvert(true)}
          className="flex h-[53px] w-full items-center justify-center rounded-[26.5px] text-sm font-bold text-white shadow-lg shadow-blue-900/20"
          style={{ backgroundImage: DEGRADE_HEADER_RECLAMATION }}
        >
          Créer une réclamation
        </button>
      </div>

      <TiroirNouvelleReclamation ouvert={tiroirOuvert} onFermer={() => setTiroirOuvert(false)} onCree={recharger} />
    </main>
  );
}
