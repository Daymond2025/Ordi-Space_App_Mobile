"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiRequestError } from "@/lib/api";
import { ChampPhotoProfil } from "@/components/auth/ChampPhotoProfil";
import { CadreAuth } from "@/components/auth/kit/CadreAuth";
import { ChampFlottant, IconePersonne } from "@/components/auth/kit/ChampFlottant";
import { BoutonAuth, BoutonRetour, Etapes, MessageErreur } from "@/components/auth/kit/BoutonAuth";
import type { HumeurMascotte } from "@/components/auth/kit/MascotteVivante";
import { THEME_AUTH } from "@/components/auth/kit/themeAuth";

/**
 * Numéro inconnu à la connexion : création du compte client (nom, prénom
 * optionnel, photo optionnelle), puis code WhatsApp.
 */
export function FormulaireInscription() {
  const { inscrireParTelephone } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const telephone = searchParams.get("telephone") ?? "";
  const r = THEME_AUTH.repliques;

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | null>(null);
  const [compteurErreurs, setCompteurErreurs] = useState(0);
  const [chargement, setChargement] = useState(false);
  const [focus, setFocus] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErreurGenerale(null);

    if (!telephone) {
      setErreurGenerale("Numéro manquant — recommence depuis l'écran de connexion.");
      setCompteurErreurs((n) => n + 1);
      return;
    }
    if (!nom.trim()) {
      setErreurs({ nom: "Le nom est requis." });
      setCompteurErreurs((n) => n + 1);
      return;
    }

    setErreurs({});
    setChargement(true);
    try {
      const resultat = await inscrireParTelephone(telephone, nom, prenom || undefined, photo || undefined);
      const params = new URLSearchParams({ telephone, user_id: String(resultat.userId) });
      if (resultat.codeDebug) params.set("code_debug", resultat.codeDebug);
      const suite = searchParams.get("next");
      if (suite) params.set("next", suite);

      router.push(`/connexion/verification?${params.toString()}`);
    } catch (erreur) {
      setCompteurErreurs((n) => n + 1);
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

  const premiereErreur = erreurGenerale ?? Object.values(erreurs)[0] ?? null;
  let humeur: HumeurMascotte = "repos";
  let bulle = r.nom;
  if (premiereErreur) {
    humeur = "erreur";
    bulle = r.erreur;
  } else if (nom.trim()) {
    humeur = "saisie";
    bulle = `Enchanté${prenom.trim() ? `, ${prenom.trim()}` : ""} ! 💙`;
  } else if (focus) {
    humeur = "saisie";
  }

  return (
    <CadreAuth humeur={humeur} bulle={bulle} declencheur={compteurErreurs}>
      <form onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
        <div className="flex items-center gap-3">
          <BoutonRetour onClick={() => router.back()} />
          <div className="flex-1">
            <Etapes etapes={["Numéro", "Profil", "Code"]} active={1} />
          </div>
        </div>

        <h2 className="mt-5 text-2xl font-black text-slate-900">Crée ton compte</h2>
        <p className="mt-1.5 text-sm text-slate-500">
          Bienvenue dans ton Ordi&apos;Space
          {telephone ? <span className="font-bold text-[var(--auth-accent)]"> · +{telephone.replace(/^\+/, "")}</span> : null}
        </p>

        <div className="mt-5 flex justify-center">
          <ChampPhotoProfil onChange={setPhoto} />
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <ChampFlottant
            type="text"
            label="Nom"
            value={nom}
            onChange={(v) => {
              setNom(v);
              setErreurs({});
            }}
            icone={<IconePersonne />}
            valide={nom.trim().length > 1}
            enErreur={Boolean(erreurs.nom)}
            declencheurErreur={compteurErreurs}
            autoComplete="family-name"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
          <ChampFlottant
            type="text"
            label="Prénom (optionnel)"
            value={prenom}
            onChange={setPrenom}
            icone={<IconePersonne />}
            enErreur={Boolean(erreurs.prenom)}
            declencheurErreur={compteurErreurs}
            autoComplete="given-name"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>

        <MessageErreur erreur={premiereErreur} />

        <div className="min-h-6 flex-1" />

        <BoutonAuth type="submit" chargement={chargement} texteChargement="Création…" className="mt-8">
          Créer mon compte
        </BoutonAuth>

        <Link
          href={`/connexion${telephone ? `?telephone=${encodeURIComponent(telephone)}` : ""}`}
          className="mt-4 text-center text-sm font-bold text-[var(--auth-accent)] underline-offset-2 hover:underline"
        >
          Déjà un compte ? Se connecter
        </Link>
      </form>
    </CadreAuth>
  );
}
