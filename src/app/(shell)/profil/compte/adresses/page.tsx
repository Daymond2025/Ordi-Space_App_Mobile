"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { ChampTexte } from "@/components/auth/ChampTexte";
import { BoutonPrincipal } from "@/components/auth/BoutonPrincipal";
import { ChevronLeftIcon, MapPinIcon } from "@/components/icons";

type Adresse = {
  id: number;
  libelle: string | null;
  rue: string;
  ville: string;
  pays: string;
};

export default function AdressesPage() {
  const { token } = useAuth();
  const [adresses, setAdresses] = useState<Adresse[] | null>(null);
  const [formulaireOuvert, setFormulaireOuvert] = useState(false);

  const [libelle, setLibelle] = useState("");
  const [rue, setRue] = useState("");
  const [ville, setVille] = useState("");
  const [pays, setPays] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<Adresse[]>("/moi/adresses", { token }).then(setAdresses);
  }, [token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    setErreurs({});
    setChargement(true);

    try {
      const nouvelleAdresse = await apiFetch<Adresse>("/moi/adresses", {
        method: "POST",
        token,
        body: { libelle: libelle || null, rue, ville, pays },
      });

      // Mise à jour directe depuis la réponse de création plutôt qu'un
      // second aller-retour réseau — plus simple et plus réactif.
      setAdresses((precedentes) => [...(precedentes ?? []), nouvelleAdresse]);
      setLibelle("");
      setRue("");
      setVille("");
      setPays("");
      setFormulaireOuvert(false);
    } catch (erreur) {
      if (erreur instanceof ApiRequestError && erreur.fields) {
        setErreurs(Object.fromEntries(Object.entries(erreur.fields).map(([champ, msgs]) => [champ, msgs[0]])));
      }
    } finally {
      setChargement(false);
    }
  }

  async function onSupprimer(id: number) {
    if (!token) return;
    await apiFetch(`/moi/adresses/${id}`, { method: "DELETE", token });
    setAdresses((precedentes) => precedentes?.filter((adresse) => adresse.id !== id) ?? null);
  }

  return (
    <main className="min-h-full pb-10">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/profil/compte" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-brand-ink">Mes adresses</h1>
      </div>

      <div className="mt-4 flex flex-col gap-3 px-4">
        {adresses === null ? (
          <p className="text-sm text-brand-muted">Chargement…</p>
        ) : adresses.length === 0 ? (
          <p className="text-sm text-brand-muted">Vous n&apos;avez pas encore ajouté d&apos;adresse.</p>
        ) : (
          adresses.map((adresse) => (
            <div key={adresse.id} className="flex items-start gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm">
              <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F2F6] text-brand-muted">
                <MapPinIcon className="h-4 w-4" />
              </span>
              <div className="flex-1">
                {adresse.libelle ? <p className="text-sm font-semibold text-brand-ink">{adresse.libelle}</p> : null}
                <p className="text-sm text-brand-muted">
                  {adresse.rue}, {adresse.ville}, {adresse.pays}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onSupprimer(adresse.id)}
                className="text-xs font-medium text-rose-500"
              >
                Supprimer
              </button>
            </div>
          ))
        )}

        {formulaireOuvert ? (
          <form onSubmit={onSubmit} className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
            <ChampTexte label="Libellé" value={libelle} onChange={setLibelle} placeholder="Domicile, bureau…" />
            <ChampTexte label="Rue" required value={rue} onChange={setRue} erreur={erreurs.rue} />
            <div className="grid grid-cols-2 gap-3">
              <ChampTexte label="Ville" required value={ville} onChange={setVille} erreur={erreurs.ville} />
              <ChampTexte label="Pays" required value={pays} onChange={setPays} erreur={erreurs.pays} />
            </div>
            <BoutonPrincipal chargement={chargement} texteChargement="Ajout…">
              Enregistrer l&apos;adresse
            </BoutonPrincipal>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setFormulaireOuvert(true)}
            className="rounded-2xl border border-dashed border-brand-line py-3.5 text-sm font-medium text-brand-muted"
          >
            + Ajouter une adresse
          </button>
        )}
      </div>
    </main>
  );
}
