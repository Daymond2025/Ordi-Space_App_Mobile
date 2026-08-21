"use client";

import { useState } from "react";
import { CalendarIcon, ChevronDownIcon, ClockIcon } from "@/components/icons";

const DEGRADE_APPEL = "linear-gradient(270deg, #00BFFF 0%, #0077FF 100%)";

export function FeuilleRendezVous({
  ouvert,
  fermer,
  raisons,
}: {
  ouvert: boolean;
  fermer: () => void;
  raisons: string[];
}) {
  const [raison, setRaison] = useState("");
  const [date, setDate] = useState("");
  const [heure, setHeure] = useState("");
  const [demande, setDemande] = useState(false);

  function demander() {
    if (!raison || !date || !heure) return;
    setDemande(true);
  }

  return (
    <div className={`fixed inset-0 z-30 ${ouvert ? "" : "pointer-events-none"}`} aria-hidden={!ouvert}>
      <div
        onClick={fermer}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${ouvert ? "opacity-100" : "opacity-0"}`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl rounded-t-[2rem] bg-white pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 ${
          ouvert ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <button type="button" onClick={fermer} aria-label="Fermer" className="mx-auto block h-1.5 w-10 rounded-full bg-brand-line" />

        <h2 className="mt-4 text-center text-sm font-bold uppercase tracking-wide text-brand-ink">Prendre Rendez-vous</h2>

        {demande ? (
          <p className="mx-6 mt-6 text-center text-xs leading-relaxed text-brand-muted">
            Cette fonctionnalité arrive bientôt : la prise de rendez-vous en ligne n&apos;est pas encore disponible.
            En attendant, contactez ce point de maintenance via WhatsApp ou téléphone.
          </p>
        ) : (
          <div className="mt-6 flex flex-col gap-3 px-5">
            <div className="relative">
              <select
                value={raison}
                onChange={(e) => setRaison(e.target.value)}
                className="h-14 w-full appearance-none rounded-2xl border border-brand-line px-4 pr-10 text-sm text-brand-ink"
              >
                <option value="" disabled>
                  Pourquoi voulez-vous un rendez-vous ?
                </option>
                {raisons.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-ink" />
            </div>

            <div className="relative">
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Quand voulez-vous passer ?"
                className="sans-icone-native h-14 w-full appearance-none rounded-2xl border border-brand-line px-4 pr-10 text-sm text-brand-ink"
              />
              <CalendarIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-ink" />
            </div>

            <div className="relative">
              <input
                type="time"
                value={heure}
                onChange={(e) => setHeure(e.target.value)}
                placeholder="À quelle heure ?"
                className="sans-icone-native h-14 w-full appearance-none rounded-2xl border border-brand-line px-4 pr-10 text-sm text-brand-ink"
              />
              <ClockIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-brand-ink" />
            </div>
          </div>
        )}

        <div className="mt-6 px-5">
          <button
            type="button"
            onClick={demander}
            className="flex h-[53px] w-full items-center justify-center rounded-[26.5px] text-sm font-bold text-white shadow-md shadow-blue-200"
            style={{ backgroundImage: DEGRADE_APPEL }}
          >
            Prendre Rendez-vous
          </button>
        </div>
      </div>
    </div>
  );
}
