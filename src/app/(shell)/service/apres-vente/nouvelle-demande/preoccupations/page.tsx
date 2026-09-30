"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { formaterPrix, type Achat, type AchatDetail } from "@/lib/types";
import { ChevronDownIcon, PlusIcon } from "@/components/icons";
import { EnTeteApresVente } from "../EnTeteApresVente";

const DEGRADE_ENVOYER = "linear-gradient(90deg, #0077FF 0%, #00BFFF 100%)";

const TYPES_PROBLEME = [
  "Produit défectueux",
  "Colis endommagé",
  "Livraison en retard",
  "Facture incorrecte",
  "Produit non conforme",
  "Autre problème",
];

export default function PreoccupationsApresVentePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();

  const [achat, setAchat] = useState<Achat | null>(null);
  const [typeProbleme, setTypeProbleme] = useState("");
  const [description, setDescription] = useState("");
  const [fichiers, setFichiers] = useState<File[]>([]);
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, setEnvoi] = useState(false);
  const inputFichierRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!token) return;
    const achatId = searchParams.get("achat");
    if (!achatId) return;
    apiFetch<AchatDetail>(`/moi/achats/${achatId}`, { token }).then((detail) => setAchat(detail.ligne));
  }, [token, searchParams]);

  function ajouterFichiers(liste: FileList | null) {
    if (!liste || liste.length === 0) return;
    setFichiers((prev) => [...prev, ...Array.from(liste)]);
    if (inputFichierRef.current) inputFichierRef.current.value = "";
  }

  function retirerFichier(index: number) {
    setFichiers((prev) => prev.filter((_, i) => i !== index));
  }

  async function envoyer() {
    if (!token || !achat || !typeProbleme || !description.trim()) {
      setErreur("Choisissez un type de problème et décrivez-le avant d'envoyer.");
      return;
    }

    setErreur(null);
    setEnvoi(true);
    try {
      const reclamation = await apiFetch<{ id: number }>("/reclamations", {
        method: "POST",
        token,
        body: { commande_id: achat.commande.id, sujet: typeProbleme, description: description.trim() },
      });

      if (fichiers.length > 0) {
        const formData = new FormData();
        fichiers.forEach((fichier) => formData.append("images[]", fichier));
        await apiFetch(`/reclamations/${reclamation.id}/preuves`, { method: "POST", token, body: formData });
      }

      router.push(`/reclamations/${reclamation.id}`);
    } catch (e) {
      setErreur(e instanceof ApiRequestError ? e.message : "Impossible d'envoyer votre demande.");
    } finally {
      setEnvoi(false);
    }
  }

  return (
    <main className="min-h-full pb-10">
      <EnTeteApresVente />

      <div className="relative -mt-12 rounded-t-[2rem] bg-white px-5 pb-6 pt-5 shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
        <h2 className="text-center text-base font-bold leading-snug text-brand-ink">
          Indiquez-nous vos
          <br />
          Préoccupations
        </h2>

        <div className="mt-6 flex flex-col gap-4">
          {achat ? (
            <div
              className="rounded-xl border bg-white p-4"
              style={{ borderColor: "rgba(0,0,0,0.04)", boxShadow: "0px 1px 1px 0px rgba(0,0,0,0.25)" }}
            >
              <p className="text-xs font-semibold text-brand-muted">Produit concerné</p>
              <div className="mt-2 flex items-center gap-3">
                <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl bg-[#F1F2F6]">
                  {achat.produit.images?.[0]?.url_image ? (
                    <Image src={achat.produit.images[0].url_image} alt="" fill className="object-cover" />
                  ) : null}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-brand-ink">{achat.produit.nom_produit}</p>
                  <p className="text-sm font-bold text-[color:var(--brand-blue-end)]">{formaterPrix(achat.produit.prix)} FCFA</p>
                </div>
              </div>
            </div>
          ) : null}

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

          <div className="rounded-2xl border border-brand-line p-3">
            <label className="text-sm font-bold text-brand-ink">Description du problème</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Veuillez détailler votre réclamation avec autant de précision que possible."
              className="mt-2 w-full resize-none rounded-xl bg-[#F1F2F6] px-3 py-2.5 text-sm text-brand-ink outline-none placeholder:text-brand-muted"
            />
          </div>

          <div className="rounded-2xl border border-brand-line p-3">
            <p className="text-sm font-bold text-brand-ink">Espace Preuve</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {fichiers.map((fichier, index) => (
                <div key={index} className="relative aspect-square overflow-hidden rounded-xl bg-[#E6EAF1]">
                  {/* eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), non pris en charge par next/image */}
                  <img src={URL.createObjectURL(fichier)} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => retirerFichier(index)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/50 text-xs text-white"
                    aria-label="Retirer cette image"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={() => inputFichierRef.current?.click()}
                className="flex aspect-square flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-brand-line text-brand-muted"
              >
                <PlusIcon className="h-5 w-5" />
              </button>
              <input
                ref={inputFichierRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => ajouterFichiers(e.target.files)}
              />
            </div>
            <p className="mt-2 text-[11px] italic text-brand-muted">(Important, mais pas obligatoire)</p>
          </div>

          {erreur ? <p className="text-center text-sm text-rose-500">{erreur}</p> : null}

          <div className="mt-2 flex justify-center">
            <button
              type="button"
              onClick={envoyer}
              disabled={envoi || !typeProbleme || !description.trim()}
              className="flex h-[53px] w-[296px] items-center justify-center rounded-[26.5px] text-sm font-bold text-white shadow-md shadow-blue-200 disabled:opacity-50"
              style={{ backgroundImage: DEGRADE_ENVOYER }}
            >
              {envoi ? "Envoi…" : "Envoyer"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
