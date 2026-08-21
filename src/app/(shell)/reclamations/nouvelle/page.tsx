"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { CheckCircleIcon, ChevronLeftIcon } from "@/components/icons";

export default function NouvelleReclamationPage() {
  const { token } = useAuth();
  const [sujet, setSujet] = useState("");
  const [description, setDescription] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoyee, setEnvoyee] = useState(false);

  async function envoyer() {
    if (!token || !sujet.trim() || !description.trim()) return;
    setErreur(null);
    setChargement(true);
    try {
      await apiFetch("/reclamations", {
        method: "POST",
        token,
        body: { sujet: sujet.trim(), description: description.trim() },
      });
      setEnvoyee(true);
    } catch (e) {
      setErreur(e instanceof ApiRequestError ? e.message : "Impossible d'envoyer votre réclamation.");
    } finally {
      setChargement(false);
    }
  }

  if (envoyee) {
    return (
      <main className="flex min-h-full flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
          <CheckCircleIcon className="h-8 w-8" />
        </span>
        <div>
          <p className="text-lg font-bold text-brand-ink">Réclamation envoyée</p>
          <p className="mt-1 text-sm text-brand-muted">
            Notre équipe va l&apos;examiner et vous répondra ici même.
          </p>
        </div>
        <Link href="/reclamations" className="bg-gradient-brand-blue mt-2 rounded-full px-6 py-3 text-sm font-semibold text-white">
          Voir mes réclamations
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-full pb-8">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/reclamations" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-brand-ink">Nouvelle réclamation</h1>
      </div>

      <div className="mt-5 flex flex-col gap-4 px-4">
        {erreur ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{erreur}</p> : null}

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-brand-muted">Sujet</label>
          <input
            value={sujet}
            onChange={(e) => setSujet(e.target.value)}
            placeholder="Ex. Livraison en retard"
            className="h-12 rounded-2xl bg-white px-4 text-sm text-brand-ink shadow-sm outline-none"
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-brand-muted">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={6}
            placeholder="Décrivez votre problème en détail…"
            className="rounded-2xl bg-white px-4 py-3 text-sm text-brand-ink shadow-sm outline-none"
          />
        </div>

        <button
          type="button"
          onClick={envoyer}
          disabled={chargement || !sujet.trim() || !description.trim()}
          className="bg-gradient-brand-blue mt-2 flex h-12 items-center justify-center rounded-full text-sm font-semibold text-white disabled:opacity-50"
        >
          {chargement ? "Envoi…" : "Envoyer la réclamation"}
        </button>
      </div>
    </main>
  );
}
