"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import type { AchatDetail } from "@/lib/types";
import { CheckCircleIcon, ChevronLeftIcon, TriangleAlerteIcon } from "@/components/icons";

const DEGRADE_CONFIRMER = "linear-gradient(90deg, #0077FF 0%, #00BFFF 100%)";

export function SelectionPointMaintenance() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { token } = useAuth();
  const achatId = searchParams.get("achat");
  const description = searchParams.get("description") ?? "";

  const [achat, setAchat] = useState<AchatDetail | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(false);
  const [envoyee, setEnvoyee] = useState(false);

  useEffect(() => {
    if (!token || !achatId) return;
    apiFetch<AchatDetail>(`/moi/achats/${achatId}`, { token }).then(setAchat);
  }, [token, achatId]);

  async function confirmer() {
    if (!token || !achat) return;

    setErreur(null);
    setChargement(true);

    try {
      await apiFetch("/sav/demandes", {
        method: "POST",
        token,
        body: {
          garantie_id: achat.ligne.garantie.id,
          description_probleme: description,
        },
      });

      setEnvoyee(true);
    } catch (e) {
      setErreur(e instanceof ApiRequestError ? e.message : "Impossible d'envoyer votre déclaration.");
    } finally {
      setChargement(false);
    }
  }

  if (envoyee) {
    return (
      <main className="flex min-h-full flex-col items-center justify-center px-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
          <CheckCircleIcon className="h-9 w-9" />
        </span>
        <h1 className="mt-5 text-lg font-bold text-brand-ink">Déclaration envoyée</h1>
        <p className="mt-2 text-sm text-brand-muted">
          Notre équipe SAV va examiner votre demande et reviendra vers vous prochainement pour planifier
          l&apos;intervention.
        </p>
        <Link href="/" className="bg-gradient-brand-blue mt-6 flex h-12 w-full items-center justify-center rounded-full text-sm font-semibold text-white">
          Retour à l&apos;accueil
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-full pb-10">
      <div className="bg-gradient-brand-blue relative overflow-hidden rounded-b-[2rem] px-5 pt-4" style={{ height: 340 }}>
        <Image
          src="/images/polycone.png"
          alt=""
          width={164}
          height={139}
          className="pointer-events-none absolute opacity-[0.34]"
          style={{ top: 11, left: 31, transform: "rotate(-27.05deg)" }}
        />

        <button type="button" onClick={() => router.back()} className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-ink">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>

        <div className="pointer-events-none absolute" style={{ width: 267, height: 267, top: 9, left: 126 }}>
          <Image src="/images/mascotte_panne.png" alt="" fill className="object-contain" priority />
        </div>

        <p className="absolute bottom-8 left-5 right-28 text-base font-bold leading-snug text-white">
          La panne que vous avez déclaré nécessite une intervention technique
        </p>
      </div>

      <div className="relative -mt-12 min-h-[480px] overflow-hidden rounded-t-[2rem] bg-gradient-brand-blue px-6 pb-10 pt-8">
        <TriangleAlerteIcon className="pointer-events-none absolute left-6 top-16 h-14 w-14 rotate-[10deg] text-white/15" />
        <TriangleAlerteIcon className="pointer-events-none absolute right-6 top-8 h-24 w-24 rotate-[-8deg] text-white/15" />
        <TriangleAlerteIcon className="pointer-events-none absolute bottom-20 left-1/2 h-28 w-28 -translate-x-1/2 rotate-[6deg] text-white/10" />

        <h2 className="relative text-center text-lg font-bold leading-snug text-white">
          Sélectionnez un point de maintenance pour prendre rendez-vous
        </h2>

        <p className="relative mt-16 text-center text-sm text-white/70">
          Aucun point de maintenance disponible pour le moment.
        </p>

        {erreur ? <p className="relative mt-4 text-center text-sm text-rose-200">{erreur}</p> : null}

        <div className="relative mt-10 flex justify-center">
          <button
            type="button"
            onClick={confirmer}
            disabled={!achat || chargement}
            className="flex h-[53px] w-[296px] items-center justify-center rounded-[26.5px] border-[3px] border-white/40 text-sm font-bold text-white shadow-md shadow-blue-900/30 disabled:opacity-60"
            style={{ backgroundImage: DEGRADE_CONFIRMER }}
          >
            {chargement ? "Envoi…" : "Confirmer"}
          </button>
        </div>
      </div>
    </main>
  );
}
