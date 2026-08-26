"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiRequestError } from "@/lib/api";
import { ChampTelephoneWhatsapp } from "@/components/auth/ChampTelephoneWhatsapp";
import { BoutonAuthCompact } from "@/components/auth/BoutonAuthCompact";
import { ChevronLeftIcon } from "@/components/icons";

export function FormulaireConnexion() {
  const { demanderOtp } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [telephone, setTelephone] = useState(() => (searchParams.get("telephone") ?? "").replace(/^\+225/, ""));
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErreur(null);

    if (!telephone.trim()) {
      setErreur("Entre ton numéro whatsapp.");
      return;
    }

    setChargement(true);
    try {
      const resultat = await demanderOtp(telephone);
      const suite = searchParams.get("next");
      const params = new URLSearchParams({ telephone });
      if (suite) params.set("next", suite);

      if (resultat.compteExistant && resultat.userId) {
        params.set("user_id", String(resultat.userId));
        if (resultat.codeDebug) params.set("code_debug", resultat.codeDebug);
        router.push(`/connexion/verification?${params.toString()}`);
      } else {
        router.push(`/inscription?${params.toString()}`);
      }
    } catch (erreur) {
      setErreur(erreur instanceof ApiRequestError ? erreur.message : "Impossible de se connecter. Vérifiez votre connexion internet.");
    } finally {
      setChargement(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-xl flex-col bg-white pb-10 md:my-6 md:min-h-[calc(100dvh-3rem)] md:max-h-[calc(100dvh-3rem)] md:overflow-y-auto md:rounded-[2rem] md:shadow-2xl md:shadow-slate-900/15 md:ring-1 md:ring-black/5">
      <div className="bg-gradient-brand-blue relative flex flex-col items-center rounded-b-[2.5rem] px-6 pb-6 pt-6 text-white">
        <button
          type="button"
          onClick={() => router.back()}
          className="absolute left-4 top-6 flex h-9 w-9 items-center justify-center rounded-full bg-white/20"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="mt-2 text-center text-2xl font-extrabold leading-snug">
          Connecte-toi
          <br />
          a ton Ordi&apos;space
        </h1>

        <Image
          src="/images/mascotte.png"
          alt=""
          width={275}
          height={274}
          className="mt-2 h-[178px] w-[179px] object-contain"
          priority
        />
      </div>

      <form onSubmit={onSubmit} className="relative -mt-6 flex flex-1 flex-col rounded-t-[2rem] bg-white px-6 pb-8 pt-5">
        <div className="mx-auto mb-8 h-1.5 w-12 rounded-full bg-brand-line" />

        <h2 className="text-center text-lg font-bold text-brand-ink">
          Entre ton numéro
          <br />
          whatsapp
        </h2>

        <div className="mt-8">
          <ChampTelephoneWhatsapp value={telephone} onChange={setTelephone} erreur={erreur ?? undefined} autoFocus />
        </div>

        <div className="flex-1" />

        <BoutonAuthCompact chargement={chargement} texteChargement="Vérification…" className="mt-10">
          connexion
        </BoutonAuthCompact>
      </form>
    </main>
  );
}
