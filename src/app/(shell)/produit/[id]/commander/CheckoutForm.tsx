"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { formaterPrix, type Adresse, type Localite, type Produit } from "@/lib/types";
import { ImageProduitCard } from "@/components/ImageProduitCard";
import { ChampTexte } from "@/components/auth/ChampTexte";
import { BoutonPrincipal } from "@/components/auth/BoutonPrincipal";
import { CheckCircleIcon, ChevronLeftIcon, MapPinIcon } from "@/components/icons";

type Commande = {
  id: number;
  statut_commande: string;
  montant_total: string;
  montant_remise: string;
};

const CARTE = "rounded-2xl bg-white p-4 shadow-sm shadow-slate-900/5";

export function CheckoutForm({ id }: { id: string }) {
  const { token, pret } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const quantite = Math.max(1, Number(searchParams.get("quantite") ?? 1));

  const [produit, setProduit] = useState<Produit | null>(null);
  const [adresses, setAdresses] = useState<Adresse[] | null>(null);
  const [adresseId, setAdresseId] = useState<number | null>(null);
  const [localites, setLocalites] = useState<Localite[] | null>(null);
  const [formulaireAdresseOuvert, setFormulaireAdresseOuvert] = useState(false);
  const [rue, setRue] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("Côte d'Ivoire");
  const [localiteId, setLocaliteId] = useState<number | "">("");
  const [erreurAdresse, setErreurAdresse] = useState<string | null>(null);
  const [enregistrementAdresse, setEnregistrementAdresse] = useState(false);

  const [codePromo, setCodePromo] = useState("");
  const [codeParrainage, setCodeParrainage] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [commandeConfirmee, setCommandeConfirmee] = useState<Commande | null>(null);

  // Garde d'authentification : navigation libre jusqu'ici, mais commander
  // exige un compte — on revient pile sur cette page après connexion.
  useEffect(() => {
    if (pret && !token) {
      router.replace(`/connexion?next=${encodeURIComponent(`/produit/${id}/commander?quantite=${quantite}`)}`);
    }
  }, [pret, token, router, id, quantite]);

  useEffect(() => {
    apiFetch<Produit>(`/produits/${id}`).then(setProduit);
  }, [id]);

  useEffect(() => {
    if (!token) return;
    apiFetch<Adresse[]>("/moi/adresses", { token }).then((liste) => {
      setAdresses(liste);
      if (liste.length > 0) setAdresseId(liste[0].id);
    });
  }, [token]);

  // Liste publique, utilisée pour le rapprochement tarifaire des frais de
  // livraison (FraisLivraisonProduit) — chargée seulement à l'ouverture du
  // formulaire d'ajout, pas avant (évite un appel inutile si le client a déjà une adresse).
  useEffect(() => {
    if (!formulaireAdresseOuvert || localites) return;
    apiFetch<Localite[]>("/localites").then(setLocalites);
  }, [formulaireAdresseOuvert, localites]);

  async function onAjouterAdresse() {
    if (!token) return;

    if (!rue.trim() || !ville.trim() || !pays.trim() || !localiteId) {
      setErreurAdresse("Remplis la rue, la ville, le pays et la localité.");
      return;
    }

    setErreurAdresse(null);
    setEnregistrementAdresse(true);
    try {
      const nouvelle = await apiFetch<Adresse>("/moi/adresses", {
        method: "POST",
        token,
        body: { rue, ville, pays, localite_id: localiteId },
      });
      setAdresses((prev) => [...(prev ?? []), nouvelle]);
      setAdresseId(nouvelle.id);
      setFormulaireAdresseOuvert(false);
      setRue("");
      setVille("");
      setLocaliteId("");
    } catch (e) {
      setErreurAdresse(e instanceof ApiRequestError ? e.message : "Impossible d'enregistrer cette adresse.");
    } finally {
      setEnregistrementAdresse(false);
    }
  }

  async function onConfirmer() {
    if (!token || !produit) return;

    const necessiteAdresse = produit.type_livraison === "physique";
    if (necessiteAdresse && !adresseId) {
      setErreur("Choisissez une adresse de livraison.");
      return;
    }

    setErreur(null);
    setChargement(true);

    try {
      const commande = await apiFetch<Commande>("/commandes", {
        method: "POST",
        token,
        body: {
          adresse_id: necessiteAdresse ? adresseId : undefined,
          lignes: [{ produit_id: produit.id, quantite }],
          code_promo: codePromo || undefined,
          code_parrainage: codeParrainage || undefined,
        },
      });

      setCommandeConfirmee(commande);
    } catch (e) {
      setErreur(e instanceof ApiRequestError ? e.message : "Impossible de créer la commande.");
    } finally {
      setChargement(false);
    }
  }

  if (!pret || !token || !produit) {
    return <p className="px-4 py-6 text-sm text-brand-muted">Chargement…</p>;
  }

  if (commandeConfirmee) {
    return (
      <main className="flex min-h-full flex-col items-center justify-center px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircleIcon className="h-9 w-9" />
        </span>
        <h1 className="mt-5 text-lg font-bold text-brand-ink">Commande confirmée</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Commande n°{commandeConfirmee.id} — {formaterPrix(commandeConfirmee.montant_total)} CFA
          <br />
          En attente de validation par notre équipe.
        </p>

        <Link href="/mes-commandes" className="bg-gradient-brand-blue mt-6 flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white">
          Voir mes commandes
        </Link>
        <Link href="/" className="mt-3 text-sm font-medium text-brand-muted underline underline-offset-2">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  const necessiteAdresse = produit.type_livraison === "physique";
  const prixUnitaire = produit.prix_vente ?? produit.prix;
  const sousTotal = Number(prixUnitaire) * quantite;

  return (
    <main className="min-h-full bg-[#f2f5fa] pb-8">
      <div className="flex items-center gap-3 bg-white px-4 py-4">
        <Link href={`/produit/${id}`} className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#F2F5FA] text-brand-ink">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-brand-ink">Confirmer la commande</h1>
      </div>

      <div className={`mx-4 mt-4 flex items-center gap-3 ${CARTE}`}>
        <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl">
          <ImageProduitCard images={produit.images} nom={produit.nom_produit} sizes="64px" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-brand-ink">{produit.nom_produit}</p>
          <p className="text-xs text-brand-muted">
            Quantité : {quantite} × {formaterPrix(prixUnitaire)} CFA
          </p>
        </div>
        <p className="text-sm font-bold text-[color:var(--brand-blue-end)]">{formaterPrix(sousTotal)} CFA</p>
      </div>

      {necessiteAdresse ? (
        <section className={`mx-4 mt-4 ${CARTE}`}>
          <p className="text-sm font-semibold text-brand-ink">Adresse de livraison</p>

          <div className="mt-3 flex flex-col gap-2">
            {adresses?.map((adresse) => (
              <button
                key={adresse.id}
                type="button"
                onClick={() => setAdresseId(adresse.id)}
                className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-left ${
                  adresseId === adresse.id ? "border-[color:var(--brand-blue-end)] bg-blue-50" : "border-brand-line bg-white"
                }`}
              >
                <MapPinIcon className="mt-0.5 h-4 w-4 shrink-0 text-brand-muted" />
                <span className="text-sm text-brand-ink">
                  {adresse.libelle ? <span className="font-semibold">{adresse.libelle} — </span> : null}
                  {adresse.rue}, {adresse.ville}
                  {adresse.localite ? ` (${adresse.localite.nom})` : ""}, {adresse.pays}
                </span>
              </button>
            ))}

            {formulaireAdresseOuvert ? (
              <div className="flex flex-col gap-3 rounded-2xl border border-brand-line bg-white p-4">
                <ChampTexte label="Rue" value={rue} onChange={setRue} />
                <div className="grid grid-cols-2 gap-3">
                  <ChampTexte label="Ville" value={ville} onChange={setVille} />
                  <ChampTexte label="Pays" value={pays} onChange={setPays} />
                </div>

                <div>
                  <label htmlFor="localite" className="mb-1.5 block text-sm font-medium text-brand-ink">
                    Localité (commune / ville)
                  </label>
                  <select
                    id="localite"
                    value={localiteId}
                    onChange={(e) => setLocaliteId(e.target.value ? Number(e.target.value) : "")}
                    className="w-full rounded-2xl border border-brand-line bg-white px-4 py-3 text-sm text-brand-ink outline-none focus:border-[color:var(--brand-blue-end)]"
                  >
                    <option value="">Sélectionner…</option>
                    {localites?.map((localite) => (
                      <option key={localite.id} value={localite.id}>
                        {localite.nom}
                      </option>
                    ))}
                  </select>
                  <p className="mt-1 text-xs text-brand-muted">Sert à calculer les frais de livraison vers chez toi.</p>
                </div>

                {erreurAdresse ? <p className="text-xs text-rose-500">{erreurAdresse}</p> : null}

                <button
                  type="button"
                  onClick={onAjouterAdresse}
                  disabled={enregistrementAdresse}
                  className="bg-gradient-brand-blue h-11 rounded-full text-sm font-semibold text-white disabled:opacity-60"
                >
                  {enregistrementAdresse ? "Enregistrement…" : "Enregistrer cette adresse"}
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setFormulaireAdresseOuvert(true)}
                className="rounded-2xl border border-dashed border-brand-line py-3 text-sm font-medium text-brand-muted"
              >
                + Ajouter une adresse
              </button>
            )}
          </div>
        </section>
      ) : (
        <p className={`mx-4 mt-4 text-xs text-brand-muted ${CARTE}`}>
          Produit numérique — aucune livraison physique, disponible immédiatement après paiement.
        </p>
      )}

      <section className={`mx-4 mt-4 flex flex-col gap-3 ${CARTE}`}>
        <ChampTexte label="Code promo (optionnel)" value={codePromo} onChange={setCodePromo} placeholder="WELCOME2026" />
        <ChampTexte label="Code de parrainage (optionnel)" value={codeParrainage} onChange={setCodeParrainage} placeholder="ACHAT-KO-2026" />
      </section>

      {erreur ? <p className="mt-4 px-4 text-sm text-rose-500">{erreur}</p> : null}

      <div className="mt-6 px-4">
        <BoutonPrincipal onClick={onConfirmer} chargement={chargement} texteChargement="Confirmation…">
          Confirmer la commande — {formaterPrix(sousTotal)} CFA
        </BoutonPrincipal>
      </div>
    </main>
  );
}
