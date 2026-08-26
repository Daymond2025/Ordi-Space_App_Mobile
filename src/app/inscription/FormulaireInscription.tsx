"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiRequestError } from "@/lib/api";
import { ChampTexte } from "@/components/auth/ChampTexte";
import { BoutonPrincipal } from "@/components/auth/BoutonPrincipal";
import { ChevronLeftIcon } from "@/components/icons";

export function FormulaireInscription() {
  const { inscrireParTelephone } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const telephone = searchParams.get("telephone") ?? "";

  const [nom, setNom] = useState("");
  const [prenom, setPrenom] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErreurGenerale(null);

    if (!telephone) {
      setErreurGenerale("Numéro manquant — recommence depuis l'écran de connexion.");
      return;
    }
    if (!nom.trim()) {
      setErreurs({ nom: "Le nom est requis." });
      return;
    }

    setErreurs({});
    setChargement(true);
    try {
      const resultat = await inscrireParTelephone(telephone, nom, prenom || undefined);
      const params = new URLSearchParams({ telephone, user_id: String(resultat.userId) });
      if (resultat.codeDebug) params.set("code_debug", resultat.codeDebug);
      const suite = searchParams.get("next");
      if (suite) params.set("next", suite);

      router.push(`/connexion/verification?${params.toString()}`);
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
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col bg-white pb-10 md:my-6 md:min-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto md:rounded-[2rem] md:shadow-2xl md:shadow-slate-900/15 md:ring-1 md:ring-black/5">
      <div className="bg-gradient-brand-blue relative flex flex-col items-center rounded-b-[2.5rem] px-6 pb-16 pt-6 text-white">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/20"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="mt-16 text-center text-2xl font-extrabold leading-snug">
          Bienvenue
          <br />
          sur Ordi&apos;space
        </h1>
      </div>

      <form onSubmit={onSubmit} className="relative -mt-8 flex flex-1 flex-col rounded-t-[2rem] bg-white px-6 pb-8 pt-5">
        <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-brand-line" />

        <h2 className="text-center text-lg font-bold text-brand-ink">
          Finalise la création
          <br />
          de ton compte
        </h2>
        <p className="mt-2 text-center text-sm text-brand-muted">
          Ce numéro n&apos;est pas encore enregistré. Renseigne ton identité pour continuer.
        </p>
        {telephone ? (
          <p className="mt-1 text-center text-sm font-semibold text-[color:var(--brand-blue-end)]">+{telephone.replace(/^\+/, "")}</p>
        ) : null}

        <div className="mt-8 flex flex-col gap-4">
          <ChampTexte label="Nom" required value={nom} onChange={setNom} erreur={erreurs.nom} autoComplete="family-name" autoFocus />
          <ChampTexte label="Prénom" value={prenom} onChange={setPrenom} erreur={erreurs.prenom} autoComplete="given-name" />
        </div>

        {erreurGenerale ? <p className="mt-3 text-sm text-rose-500">{erreurGenerale}</p> : null}

        <div className="flex-1" />

        <BoutonPrincipal chargement={chargement} texteChargement="Création du compte…" className="mt-10">
          continuer
        </BoutonPrincipal>
      </form>
    </main>
  );
}
