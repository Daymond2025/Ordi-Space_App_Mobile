"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { ChampTexte } from "@/components/auth/ChampTexte";
import { ChampMotDePasse } from "@/components/auth/ChampMotDePasse";
import { BoutonPrincipal } from "@/components/auth/BoutonPrincipal";
import { ChevronLeftIcon } from "@/components/icons";

type ProfilDetail = {
  nom: string;
  prenom: string | null;
  email: string;
  telephone: string | null;
};

export default function InformationsPage() {
  const { token } = useAuth();

  const [chargementInitial, setChargementInitial] = useState(true);
  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasseActuel, setMotDePasseActuel] = useState("");
  const [nouveauMotDePasse, setNouveauMotDePasse] = useState("");
  const [nouveauMotDePasseConfirmation, setNouveauMotDePasseConfirmation] = useState("");

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  useEffect(() => {
    if (!token) return;

    apiFetch<ProfilDetail>("/moi/profil", { token }).then((profil) => {
      setNom(profil.nom);
      setPrenom(profil.prenom ?? "");
      setEmail(profil.email);
      setTelephone(profil.telephone ?? "");
      setChargementInitial(false);
    });
  }, [token]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!token) return;

    setErreurs({});
    setMessage(null);
    setChargement(true);

    try {
      await apiFetch("/moi/profil", {
        method: "PATCH",
        token,
        body: {
          nom,
          prenom: prenom || null,
          telephone: telephone || null,
          email,
          ...(nouveauMotDePasse
            ? {
                mot_de_passe_actuel: motDePasseActuel,
                nouveau_mot_de_passe: nouveauMotDePasse,
                nouveau_mot_de_passe_confirmation: nouveauMotDePasseConfirmation,
              }
            : {}),
        },
      });

      setMessage("Vos informations ont été mises à jour.");
      setMotDePasseActuel("");
      setNouveauMotDePasse("");
      setNouveauMotDePasseConfirmation("");
    } catch (erreur) {
      if (erreur instanceof ApiRequestError && erreur.fields) {
        setErreurs(Object.fromEntries(Object.entries(erreur.fields).map(([champ, msgs]) => [champ, msgs[0]])));
      } else if (erreur instanceof ApiRequestError) {
        setMessage(erreur.message);
      }
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="min-h-full pb-10">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/profil/compte" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-brand-ink">Mes informations personnelles</h1>
      </div>

      {chargementInitial ? (
        <p className="px-4 pt-6 text-sm text-brand-muted">Chargement…</p>
      ) : (
        <form onSubmit={onSubmit} className="mt-4 flex flex-col gap-4 px-4">
          <div className="grid grid-cols-2 gap-3">
            <ChampTexte label="Nom" required value={nom} onChange={setNom} erreur={erreurs.nom} />
            <ChampTexte label="Prénom" value={prenom} onChange={setPrenom} erreur={erreurs.prenom} />
          </div>
          <ChampTexte label="Adresse e-mail" type="email" required value={email} onChange={setEmail} erreur={erreurs.email} />
          <ChampTexte label="Téléphone" type="tel" value={telephone} onChange={setTelephone} erreur={erreurs.telephone} />

          <div className="mt-2 border-t border-brand-line pt-4">
            <p className="text-sm font-semibold text-brand-ink">Changer le mot de passe</p>
            <p className="mt-1 text-xs text-brand-muted">Laissez vide si vous ne souhaitez pas le modifier.</p>

            <div className="mt-3 flex flex-col gap-4">
              <ChampMotDePasse
                label="Mot de passe actuel"
                value={motDePasseActuel}
                onChange={setMotDePasseActuel}
                erreur={erreurs.mot_de_passe_actuel}
                autoComplete="current-password"
              />
              <ChampMotDePasse
                label="Nouveau mot de passe"
                value={nouveauMotDePasse}
                onChange={setNouveauMotDePasse}
                erreur={erreurs.nouveau_mot_de_passe}
                autoComplete="new-password"
              />
              <ChampMotDePasse
                label="Confirmer le nouveau mot de passe"
                value={nouveauMotDePasseConfirmation}
                onChange={setNouveauMotDePasseConfirmation}
                autoComplete="new-password"
              />
            </div>
          </div>

          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

          <BoutonPrincipal chargement={chargement} texteChargement="Enregistrement…" className="mt-2">
            Enregistrer
          </BoutonPrincipal>
        </form>
      )}
    </main>
  );
}
