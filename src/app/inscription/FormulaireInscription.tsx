"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiRequestError } from "@/lib/api";
import { ChampTexte } from "@/components/auth/ChampTexte";
import { ChampMotDePasse } from "@/components/auth/ChampMotDePasse";
import { BoutonPrincipal } from "@/components/auth/BoutonPrincipal";
import { EnTeteAuth } from "@/components/auth/EnTeteAuth";

const MOT_DE_PASSE_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

export function FormulaireInscription() {
  const { register } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [email, setEmail] = useState("");
  const [telephone, setTelephone] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [confirmation, setConfirmation] = useState("");

  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  function validerLocalement(): boolean {
    const nouvellesErreurs: Record<string, string> = {};

    if (!nom.trim()) nouvellesErreurs.nom = "Le nom est requis.";
    if (!email.trim()) nouvellesErreurs.email = "L'adresse e-mail est requise.";
    if (!MOT_DE_PASSE_REGEX.test(motDePasse)) {
      nouvellesErreurs.password = "8 caractères min., avec majuscule, minuscule et chiffre.";
    } else if (motDePasse !== confirmation) {
      nouvellesErreurs.password_confirmation = "Les deux mots de passe ne correspondent pas.";
    }

    setErreurs(nouvellesErreurs);
    return Object.keys(nouvellesErreurs).length === 0;
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErreurGenerale(null);

    if (!validerLocalement()) return;

    setChargement(true);
    try {
      await register({
        nom,
        prenom: prenom || undefined,
        email,
        telephone: telephone || undefined,
        password: motDePasse,
        password_confirmation: confirmation,
      });
      router.replace(searchParams.get("next") ?? "/");
    } catch (erreur) {
      if (erreur instanceof ApiRequestError) {
        if (erreur.fields) {
          setErreurs(Object.fromEntries(Object.entries(erreur.fields).map(([champ, msgs]) => [champ, msgs[0]])));
        } else {
          setErreurGenerale(erreur.message);
        }
      } else {
        setErreurGenerale("Impossible de créer le compte. Vérifiez votre connexion internet.");
      }
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="mx-auto min-h-full w-full max-w-xl bg-background pb-10 md:my-6 md:min-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto md:rounded-[2rem] md:shadow-2xl md:shadow-slate-900/15 md:ring-1 md:ring-black/5">
      <EnTeteAuth
        titre="Rejoins Ordi'Space"
        sousTitre="Crée ton compte pour commander, suivre tes garanties et profiter des privilèges."
      />

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 px-6">
        <div className="grid grid-cols-2 gap-3">
          <ChampTexte label="Nom" required value={nom} onChange={setNom} erreur={erreurs.nom} autoComplete="family-name" />
          <ChampTexte label="Prénom" value={prenom} onChange={setPrenom} erreur={erreurs.prenom} autoComplete="given-name" />
        </div>

        <ChampTexte
          label="Adresse e-mail"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={setEmail}
          erreur={erreurs.email}
          placeholder="marc@example.com"
        />

        <ChampTexte
          label="Téléphone"
          type="tel"
          autoComplete="tel"
          value={telephone}
          onChange={setTelephone}
          erreur={erreurs.telephone}
          placeholder="Optionnel"
        />

        <ChampMotDePasse
          label="Mot de passe"
          autoComplete="new-password"
          value={motDePasse}
          onChange={setMotDePasse}
          erreur={erreurs.password}
        />

        <ChampMotDePasse
          label="Confirmer le mot de passe"
          autoComplete="new-password"
          value={confirmation}
          onChange={setConfirmation}
          erreur={erreurs.password_confirmation}
        />

        {erreurGenerale ? <p className="text-sm text-rose-500">{erreurGenerale}</p> : null}

        <BoutonPrincipal chargement={chargement} texteChargement="Création du compte…" className="mt-2">
          Créer mon compte
        </BoutonPrincipal>

        <p className="mt-4 text-center text-sm text-brand-muted">
          Déjà un compte ?{" "}
          <Link href="/connexion" className="font-semibold text-brand-ink underline underline-offset-2">
            Se connecter
          </Link>
        </p>
      </form>
    </main>
  );
}
