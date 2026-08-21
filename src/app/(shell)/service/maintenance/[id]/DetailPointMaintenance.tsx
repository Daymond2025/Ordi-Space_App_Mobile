"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { POINTS_MAINTENANCE, STYLE_TAG_SERVICE } from "../data";
import { FeuilleRendezVous } from "./FeuilleRendezVous";

const DEGRADE_APPEL = "linear-gradient(270deg, #00BFFF 0%, #0077FF 100%)";
const DEGRADE_WHATSAPP = "linear-gradient(93.35deg, #36CE00 0%, #00D8A4 118.39%)";

export function DetailPointMaintenance({ id }: { id: string }) {
  const router = useRouter();
  const point = POINTS_MAINTENANCE.find((p) => p.id === Number(id));
  const [sheetOuverte, setSheetOuverte] = useState(false);

  if (!point) {
    return (
      <main className="min-h-full">
        <div className="flex items-center gap-3 px-4 pt-4">
          <button type="button" onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
            <ChevronLeftIcon className="h-5 w-5" />
          </button>
          <h1 className="text-base font-bold text-brand-ink">Point de maintenance</h1>
        </div>
        <p className="px-4 pt-6 text-sm text-brand-muted">Ce point de maintenance est introuvable.</p>
      </main>
    );
  }

  return (
    <main className="min-h-full pb-10">
      <div className="bg-gradient-brand-blue relative flex items-center gap-3 rounded-b-[2rem] px-4 pb-10 pt-4">
        <button type="button" onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <ChevronLeftIcon className="h-5 w-5 text-white" />
        </button>
        <h1 className="absolute inset-x-0 text-center text-base font-bold text-white">Point de maintenance</h1>
      </div>

      <div className="relative -mt-6 px-4">
        <div className="flex items-center gap-3 rounded-3xl bg-white p-4 shadow-lg shadow-blue-100">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-rose-50">
            <Image src="/images/maintenance.png" alt="" width={32} height={32} />
          </span>
          <p className="text-base font-extrabold uppercase text-brand-ink">{point.nom}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-3 px-4">
        <button type="button" className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm">
          <Image src="/images/locaisation.png" alt="" width={28} height={28} className="shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-ink">Localisation</p>
            <p className="mt-1 text-xs text-brand-muted">{point.localisation}</p>
          </div>
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-brand-muted" />
        </button>

        <button type="button" className="flex items-center gap-3 rounded-2xl bg-white p-4 text-left shadow-sm">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-50">
            <Image src="/images/type-service.png" alt="" width={20} height={20} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-ink">Type de service</p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {point.services.map((service) => (
                <span key={service} className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${STYLE_TAG_SERVICE[service] ?? "bg-brand-line text-brand-muted"}`}>
                  {service}
                </span>
              ))}
            </div>
          </div>
          <ChevronRightIcon className="h-4 w-4 shrink-0 text-brand-muted" />
        </button>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-ink">Maps</p>
            <span className="h-px flex-1 bg-brand-line" />
          </div>
          <div className="mt-3 flex h-28 items-center justify-center rounded-xl bg-[#EEF1F6] text-xs text-brand-muted">
            Carte à venir
          </div>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2">
            <p className="text-xs font-bold uppercase tracking-wide text-brand-ink">Contact</p>
            <span className="h-px flex-1 bg-brand-line" />
          </div>

          <div className="mt-3 flex gap-2">
            <a
              href="https://wa.me/2250000000000"
              target="_blank"
              rel="noreferrer"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-xs font-semibold text-white"
              style={{ backgroundImage: DEGRADE_WHATSAPP }}
            >
              <Image src="/images/icon-WhatsApp.png" alt="" width={16} height={16} />
              WhatsApp
            </a>
            <a
              href="tel:+2250000000000"
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-full text-xs font-semibold text-white"
              style={{ backgroundImage: DEGRADE_APPEL }}
            >
              <Image src="/images/icon-telephone.png" alt="" width={16} height={16} />
              Appelle
            </a>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center px-4">
        <button
          type="button"
          onClick={() => setSheetOuverte(true)}
          className="flex h-[53px] w-[296px] items-center justify-center rounded-[26.5px] border-[3px] border-white/40 text-sm font-bold text-white shadow-md shadow-blue-200"
          style={{ backgroundImage: DEGRADE_APPEL }}
        >
          Prendre Rendez-vous
        </button>
      </div>

      <FeuilleRendezVous ouvert={sheetOuverte} fermer={() => setSheetOuverte(false)} raisons={point.services} />
    </main>
  );
}
