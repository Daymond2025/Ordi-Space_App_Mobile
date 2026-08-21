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

export function FormulaireConnexion() {
  const { login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [erreurs, setErreurs] = useState<Record<string, string>>({});
  const [erreurGenerale, setErreurGenerale] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErreurs({});
    setErreurGenerale(null);
    setChargement(true);

    try {
      await login(email, motDePasse);
      router.replace(searchParams.get("next") ?? "/");
    } catch (erreur) {
      if (erreur instanceof ApiRequestError) {
        if (erreur.fields) {
          setErreurs(Object.fromEntries(Object.entries(erreur.fields).map(([champ, msgs]) => [champ, msgs[0]])));
        } else {
          setErreurGenerale(erreur.message);
        }
      } else {
        setErreurGenerale("Impossible de se connecter. Vérifiez votre connexion internet.");
      }
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="mx-auto min-h-full w-full max-w-xl bg-background pb-10 md:my-6 md:min-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto md:rounded-[2rem] md:shadow-2xl md:shadow-slate-900/15 md:ring-1 md:ring-black/5">
      <EnTeteAuth
        titre="Content de te revoir 👋"
        sousTitre="Connecte-toi pour retrouver tes commandes, garanties et privilèges."
      />

      <form onSubmit={onSubmit} className="mt-8 flex flex-col gap-4 px-6">
        <ChampTexte
          label="Adresse e-mail"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={setEmail}
          erreur={erreurs.email}
          placeholder="marc@example.com"
        />
        <ChampMotDePasse
          label="Mot de passe"
          autoComplete="current-password"
          value={motDePasse}
          onChange={setMotDePasse}
          erreur={erreurs.password}
        />

        {erreurGenerale ? <p className="text-sm text-rose-500">{erreurGenerale}</p> : null}

        <BoutonPrincipal chargement={chargement} texteChargement="Connexion…" className="mt-2">
          Se connecter
        </BoutonPrincipal>

        <p className="mt-4 text-center text-sm text-brand-muted">
          Pas encore de compte ?{" "}
          <Link href="/inscription" className="font-semibold text-brand-ink underline underline-offset-2">
            Créer un compte
          </Link>
        </p>
      </form>
    </main>
  );
}
