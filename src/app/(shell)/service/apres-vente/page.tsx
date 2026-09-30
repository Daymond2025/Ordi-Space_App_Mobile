"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon, TriangleAlerteIcon } from "@/components/icons";

// Écran "Service après-vente" — mockup fourni. Le bouton "Service après-vente"
// ne peut pas renvoyer vers cet écran lui-même ; en attendant le mockup de
// l'écran de demande dédié, il pointe vers un portail temporaire.
const DEGRADE_FOND = "linear-gradient(105.59deg, #0C003F -28.56%, #0077FF 130.51%)";
const DEGRADE_SAV = "linear-gradient(273.52deg, #FFCC00 -3.09%, #FF7800 98.47%)";
const DEGRADE_RECLAMATIONS = "linear-gradient(105.59deg, #0C003F -28.56%, #0077FF 130.51%)";
const COULEUR_ACCENT = "#00D8A4";

export default function ServiceApresVentePage() {
  const router = useRouter();

  return (
    <main className="relative flex min-h-full flex-col overflow-hidden pb-8" style={{ backgroundImage: DEGRADE_FOND }}>
      <Image
        src="/images/polycone.png"
        alt=""
        width={164}
        height={139}
        className="pointer-events-none absolute opacity-[0.34]"
        style={{ top: 520, left: 214, transform: "rotate(-27.05deg)" }}
      />
      <TriangleAlerteIcon className="pointer-events-none absolute -left-4 top-20 h-24 w-24 rotate-[6deg] text-white/10" />
      <TriangleAlerteIcon className="pointer-events-none absolute right-4 top-[28rem] h-24 w-24 rotate-[-6deg] text-white/10" />

      <div className="relative flex items-center gap-3 px-4 pt-4">
        <button type="button" onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
          <ChevronLeftIcon className="h-5 w-5 text-white" />
        </button>
        <h1 className="absolute inset-x-0 text-center text-base font-bold text-white">Centre de maintenance</h1>
      </div>

      <div className="relative mx-auto mt-4 w-full max-w-[410px] px-8">
        <Image
          src="/images/centre-de-maintenance.png"
          alt="Centre de maintenance Ordi'Space"
          width={410}
          height={273}
          className="h-auto w-full"
          priority
        />
      </div>

      <p className="relative mt-6 px-8 text-center text-lg font-extrabold uppercase leading-snug text-white">
        Bienvenue dans <span style={{ color: COULEUR_ACCENT }}>le plus grand réseau</span> de maintenance informatique en Côte d&apos;Ivoire
      </p>

      <div className="relative mx-6 mt-6 rounded-2xl bg-white/15 px-5 py-4 backdrop-blur-sm">
        <p className="text-center text-sm font-semibold leading-relaxed text-white">
          Accès bientôt disponible pour la réparation de vos ordinateurs et tous vos besoins informatiques
        </p>
      </div>

      <div className="relative mt-auto flex flex-col items-center gap-4 px-6 pt-10">
        <p className="text-center text-xs font-medium text-white/90">Pour toutes vos préoccupations contactez-le</p>

        <Link
          href="/service/apres-vente/nouvelle-demande"
          className="flex h-[53px] w-[296px] max-w-full items-center justify-center rounded-[26.5px] border-[3px] text-sm font-bold text-white backdrop-blur-sm"
          style={{ backgroundImage: DEGRADE_SAV, borderColor: "rgba(255,255,255,0.41)" }}
        >
          Service après-vente
        </Link>

        <Link
          href="/reclamations"
          className="flex h-[53px] w-[296px] max-w-full items-center justify-center rounded-[26.5px] border-[3px] text-sm font-bold text-white backdrop-blur-sm"
          style={{ backgroundImage: DEGRADE_RECLAMATIONS, borderColor: "rgba(255,255,255,0.41)" }}
        >
          Réclamations
        </Link>
      </div>
    </main>
  );
}
