"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import type { Achat, Pagination } from "@/lib/types";
import { ChevronDownIcon, PlusIcon, SendIcon } from "@/components/icons";

const DEGRADE_ENVOYER = "linear-gradient(90deg, #0077FF 0%, #00BFFF 100%)";

// Catégories usuelles côté UI — le backend n'impose pas de liste fermée
// (sujet est un texte libre), cette liste guide juste la saisie du client.
const TYPES_PROBLEME = [
  "Produit défectueux",
  "Colis endommagé",
  "Livraison en retard",
  "Facture incorrecte",
  "Produit non conforme",
  "Autre problème",
];

export function TiroirNouvelleReclamation({
  ouvert,
  onFermer,
  onCree,
}: {
  ouvert: boolean;
  onFermer: () => void;
  onCree: () => void;
}) {
  const { token } = useAuth();
  const [achats, setAchats] = useState<Achat[] | null>(null);
  const [achatId, setAchatId] = useState<string>("");
  const [typeProbleme, setTypeProbleme] = useState("");
  const [description, setDescription] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);

  useEffect(() => {
    if (!token || !ouvert || achats !== null) return;
    apiFetch<Pagination<Achat>>("/moi/achats", { token }).then((page) => setAchats(page.data));
  }, [token, ouvert, achats]);

  function reinitialiser() {
    setAchatId("");
    setTypeProbleme("");
    setDescription("");
    setErreur(null);
  }

  async function envoyer() {
    if (!token || !typeProbleme || !description.trim()) {
      setErreur("Choisissez un type de problème et décrivez-le avant d'envoyer.");
      return;
    }

    setErreur(null);
    setEnvoi(true);
    try {
      const achat = achatId ? achats?.find((a) => a.id === Number(achatId)) : undefined;
      await apiFetch("/reclamations", {
        method: "POST",
        token,
        body: {
          commande_id: achat?.commande.id,
          sujet: typeProbleme,
          description: description.trim(),
        },
      });
      reinitialiser();
      onCree();
      onFermer();
    } catch (e) {
      setErreur(e instanceof ApiRequestError ? e.message : "Impossible d'envoyer votre réclamation.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <div className={`fixed inset-0 z-30 ${ouvert ? "" : "pointer-events-none"}`} aria-hidden={!ouvert}>
      <div
        onClick={onFermer}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${ouvert ? "opacity-100" : "opacity-0"}`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl rounded-t-[2rem] bg-white pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 ${
          ouvert ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <button type="button" onClick={onFermer} aria-label="Fermer" className="mx-auto block h-1.5 w-10 rounded-full bg-brand-line" />

        <h2 className="mt-4 text-center text-base font-bold text-brand-ink">Nouvelle Réclamation</h2>

        <div className="mt-5 flex flex-col gap-4 px-5">
          <div className="relative flex items-center gap-3 rounded-2xl bg-blue-50 p-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[color:var(--brand-blue-end)]">
              <PlusIcon className="h-4 w-4" />
            </span>
            <select
              value={achatId}
              onChange={(e) => setAchatId(e.target.value)}
              className="w-full flex-1 appearance-none bg-transparent pr-6 text-sm font-medium text-brand-ink outline-none"
            >
              <option value="">Sélectionner le produit ou la commande concernée</option>
              {achats?.map((achat) => (
                <option key={achat.id} value={achat.id}>
                  {achat.produit.nom_produit}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-4 h-4 w-4 text-brand-ink" />
          </div>

          <div className="relative">
            <select
              value={typeProbleme}
              onChange={(e) => setTypeProbleme(e.target.value)}
              className="h-12 w-full appearance-none rounded-2xl border border-brand-line bg-white px-4 text-sm text-brand-ink outline-none"
            >
              <option value="">Type de problème</option>
              {TYPES_PROBLEME.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <ChevronDownIcon className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-muted" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-bold text-brand-ink">Description du problème</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Veuillez détailler votre réclamation avec autant de précision que possible."
              className="rounded-2xl bg-[#F1F2F6] px-4 py-3 text-sm text-brand-ink outline-none placeholder:text-brand-muted"
            />
          </div>

          {erreur ? <p className="text-center text-sm text-rose-500">{erreur}</p> : null}

          <button
            type="button"
            onClick={envoyer}
            disabled={envoi || !typeProbleme || !description.trim()}
            className="mt-1 flex h-[53px] items-center justify-center gap-2 rounded-[26.5px] text-sm font-bold text-white shadow-md shadow-blue-200 disabled:opacity-50"
            style={{ backgroundImage: DEGRADE_ENVOYER }}
          >
            <SendIcon className="h-4 w-4" />
            {envoi ? "Envoi…" : "Envoyer la réclamation"}
          </button>
        </div>
      </div>
    </div>
  );
}
