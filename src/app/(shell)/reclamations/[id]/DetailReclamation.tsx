"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import {
  formaterPrix,
  formaterTempsRelatif,
  LIBELLE_STATUT_RECLAMATION,
  STYLE_STATUT_RECLAMATION,
  type ReclamationDetail,
} from "@/lib/types";
import { ChevronLeftIcon, PlusIcon, TicketIcon, TrashIcon } from "@/components/icons";
import { DEGRADE_HEADER_RECLAMATION, OMBRE_HEADER_RECLAMATION } from "../degrade";

const DEGRADE_ANNULER = "linear-gradient(273.52deg, #FFCC00 -3.09%, #FF7800 98.47%)";

export function DetailReclamation({ id }: { id: string }) {
  const { token } = useAuth();

  const [reclamation, setReclamation] = useState<ReclamationDetail | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [edition, setEdition] = useState(false);
  const [sujet, setSujet] = useState("");
  const [description, setDescription] = useState("");
  const [enCours, setEnCours] = useState(false);
  const inputFichierRef = useRef<HTMLInputElement>(null);

  function charger() {
    if (!token) return;
    apiFetch<ReclamationDetail>(`/reclamations/${id}`, { token }).then((data) => {
      setReclamation(data);
      setSujet(data.sujet);
      setDescription(data.description);
    });
  }

  useEffect(() => {
    charger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, id]);

  const modifiable = reclamation && (reclamation.statut === "nouvelle" || reclamation.statut === "en_cours");

  async function enregistrerModification() {
    if (!token || !reclamation || !sujet.trim() || !description.trim()) return;
    setErreur(null);
    setEnCours(true);
    try {
      await apiFetch(`/reclamations/${reclamation.id}`, {
        method: "PATCH",
        token,
        body: { sujet: sujet.trim(), description: description.trim() },
      });
      setEdition(false);
      charger();
    } catch (e) {
      setErreur(e instanceof ApiRequestError ? e.message : "Impossible d'enregistrer la modification.");
    } finally {
      setEnCours(false);
    }
  }

  async function annuler() {
    if (!token || !reclamation) return;
    if (!confirm("Annuler cette réclamation ? Cette action est irréversible.")) return;
    setErreur(null);
    setEnCours(true);
    try {
      await apiFetch(`/reclamations/${reclamation.id}/annuler`, { method: "PATCH", token });
      charger();
    } catch (e) {
      setErreur(e instanceof ApiRequestError ? e.message : "Impossible d'annuler cette réclamation.");
    } finally {
      setEnCours(false);
    }
  }

  async function ajouterPreuves(fichiers: FileList | null) {
    if (!token || !reclamation || !fichiers || fichiers.length === 0) return;
    setErreur(null);
    setEnCours(true);
    try {
      const formData = new FormData();
      Array.from(fichiers).forEach((fichier) => formData.append("images[]", fichier));

      await apiFetch(`/reclamations/${reclamation.id}/preuves`, {
        method: "POST",
        token,
        body: formData,
      });
      charger();
    } catch (e) {
      setErreur(e instanceof ApiRequestError ? e.message : "Impossible d'ajouter cette preuve.");
    } finally {
      setEnCours(false);
      if (inputFichierRef.current) inputFichierRef.current.value = "";
    }
  }

  async function supprimerPreuve(preuveId: number) {
    if (!token || !reclamation) return;
    setEnCours(true);
    try {
      await apiFetch(`/reclamations/${reclamation.id}/preuves/${preuveId}`, { method: "DELETE", token });
      charger();
    } catch {
      setErreur("Impossible de supprimer cette preuve.");
    } finally {
      setEnCours(false);
    }
  }

  if (!reclamation) {
    return (
      <main className="min-h-full">
        <div
          className="relative flex items-center gap-3 rounded-b-[2rem] px-4 pb-5 pt-4"
          style={{ backgroundImage: DEGRADE_HEADER_RECLAMATION, boxShadow: OMBRE_HEADER_RECLAMATION }}
        >
          <Link href="/reclamations" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <ChevronLeftIcon className="h-5 w-5 text-white" />
          </Link>
          <h1 className="text-base font-bold text-white">Détails</h1>
        </div>
        <p className="pt-10 text-center text-sm text-brand-muted">Chargement…</p>
      </main>
    );
  }

  const produit = reclamation.commande?.produit ?? null;

  return (
    <main className="min-h-full pb-10">
      <div
        className="relative flex items-center gap-3 rounded-b-[2rem] px-4 pb-5 pt-4"
        style={{ backgroundImage: DEGRADE_HEADER_RECLAMATION, boxShadow: OMBRE_HEADER_RECLAMATION }}
      >
        <Link href="/reclamations" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <ChevronLeftIcon className="h-5 w-5 text-white" />
        </Link>
        <h1 className="flex-1 text-base font-bold text-white">Détails</h1>
        <span className={`rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold uppercase ${STYLE_STATUT_RECLAMATION[reclamation.statut]}`}>
          {LIBELLE_STATUT_RECLAMATION[reclamation.statut]}
        </span>
      </div>

      <div className="relative -mt-3">
        {produit ? (
          <div
            className="mx-[22px] rounded-xl border bg-white p-4"
            style={{ borderColor: "rgba(0,0,0,0.04)", boxShadow: "0px 1px 1px 0px rgba(0,0,0,0.25)" }}
          >
            <p className="text-xs font-semibold text-brand-muted">Produits concernés</p>
            <div className="mt-2 flex items-center gap-3">
              <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#F1F2F6]">
                {produit.photo ? <Image src={produit.photo} alt="" fill className="object-cover" /> : null}
                {produit.disponible ? (
                  <span className="absolute bottom-0.5 right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
                ) : null}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-brand-ink">{produit.nom_produit}</p>
                <p className="text-sm font-bold text-[color:var(--brand-blue-end)]">{formaterPrix(produit.prix)} FCFA</p>
              </div>
              <span className="shrink-0 text-[11px] text-brand-muted">{formaterTempsRelatif(reclamation.date_reclamation)}</span>
            </div>
          </div>
        ) : null}

        {/* Feuille blanche plein-bord (pas de marge horizontale) qui englobe
            le reste — reprend l'habillage "tiroir" (poignée + rounded-t) déjà
            utilisé par ServiceSheet / TiroirNouvelleReclamation. */}
        <div className="relative mt-[19px] rounded-t-[28px] bg-white pb-6 pt-3 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
          <span className="mx-auto block h-1.5 w-10 rounded-full bg-brand-line" />

          <div className="mt-4 flex flex-col gap-4 px-4">
            <div className="rounded-2xl bg-[#F7F9FC] p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold text-brand-muted shadow-sm">
                <TicketIcon className="h-3.5 w-3.5" />
                Réclamation
              </span>

              {edition ? (
                <div className="mt-3 flex flex-col gap-2.5">
                  <input
                    value={sujet}
                    onChange={(e) => setSujet(e.target.value)}
                    className="h-11 rounded-xl bg-white px-3 text-sm font-bold text-brand-ink shadow-sm outline-none"
                  />
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="rounded-xl bg-white px-3 py-2.5 text-sm text-brand-ink shadow-sm outline-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={enregistrerModification}
                      disabled={enCours || !sujet.trim() || !description.trim()}
                      className="bg-gradient-brand-blue flex-1 rounded-full py-2 text-xs font-bold text-white disabled:opacity-50"
                    >
                      Enregistrer
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEdition(false);
                        setSujet(reclamation.sujet);
                        setDescription(reclamation.description);
                      }}
                      className="flex-1 rounded-full bg-white py-2 text-xs font-bold text-brand-ink shadow-sm"
                    >
                      Annuler la modif.
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="mt-3 text-sm font-bold text-brand-ink">{reclamation.sujet}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-brand-muted">{reclamation.description}</p>
                </>
              )}
            </div>

            {reclamation.reponse_admin ? (
              <div className="rounded-2xl bg-emerald-50 p-4">
                <p className="text-xs font-semibold text-emerald-700">Réponse d&apos;Ordi&apos;Space</p>
                <p className="mt-1.5 text-sm leading-relaxed text-emerald-800">{reclamation.reponse_admin}</p>
              </div>
            ) : null}

            <div className="rounded-2xl bg-[#F7F9FC] p-4">
              <p className="text-sm font-bold text-brand-ink">Espace Preuve</p>
              <div className="mt-3 grid grid-cols-3 gap-2">
                {reclamation.preuves.map((preuve) => (
                  <div key={preuve.id} className="relative aspect-square overflow-hidden rounded-xl bg-[#E6EAF1]">
                    <Image src={preuve.fichier} alt="" fill className="object-cover" />
                    <button
                      type="button"
                      onClick={() => supprimerPreuve(preuve.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white"
                      aria-label="Supprimer cette preuve"
                    >
                      <TrashIcon className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={() => inputFichierRef.current?.click()}
                  disabled={enCours}
                  className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand-line text-brand-muted disabled:opacity-50"
                >
                  <PlusIcon className="h-5 w-5" />
                </button>
                <input
                  ref={inputFichierRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => ajouterPreuves(e.target.files)}
                />
              </div>
            </div>

            {erreur ? <p className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-600">{erreur}</p> : null}

            {modifiable && !edition ? (
              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={annuler}
                  disabled={enCours}
                  className="flex h-[46px] flex-1 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm disabled:opacity-50"
                  style={{ backgroundImage: DEGRADE_ANNULER }}
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={() => setEdition(true)}
                  disabled={enCours}
                  className="bg-gradient-brand-blue flex h-[46px] flex-1 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm disabled:opacity-50"
                >
                  Modifier
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </main>
  );
}
