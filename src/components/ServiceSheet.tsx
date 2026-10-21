"use client";

import { useRouter } from "next/navigation";
import { useServiceSheet } from "@/context/ServiceSheetContext";
import {
  EngrenageIcon,
  HeadsetIcon,
  LifeBuoyIcon,
  MainServiceIcon,
  ShieldCheckIcon,
  TriangleAlerteIcon,
  WrenchIcon,
} from "@/components/icons";
import type { ComponentType, SVGProps } from "react";

type ServiceTile = {
  label: string;
  Icone: ComponentType<SVGProps<SVGSVGElement>>;
  bg: string;
  couleur: string;
  href: string;
};

const SERVICES: ServiceTile[] = [
  { label: "Maintenance", Icone: WrenchIcon, bg: "#FCF1DC", couleur: "#C8860D", href: "/service/maintenance" },
  { label: "Logiciels", Icone: EngrenageIcon, bg: "#DCEFFB", couleur: "#2680EB", href: "/market-space?categorie=logiciels" },
  { label: "Asistances", Icone: HeadsetIcon, bg: "#DFF5E9", couleur: "#16A34A", href: "/service/assistances" },
  { label: "GarantiX", Icone: ShieldCheckIcon, bg: "#E8F0FE", couleur: "#4F6EF7", href: "/service/garantix" },
  { label: "Déclarer une panne", Icone: TriangleAlerteIcon, bg: "#FBE1E1", couleur: "#EF4444", href: "/service/declarer-panne" },
  { label: "Service après-vente", Icone: MainServiceIcon, bg: "#E0F7F0", couleur: "#0D9488", href: "/service/apres-vente" },
  { label: "Aide rapide", Icone: LifeBuoyIcon, bg: "#EAE6FB", couleur: "#8B5CF6", href: "/profil/aide" },
];

export function ServiceSheet() {
  const { ouvert, fermer } = useServiceSheet();
  const router = useRouter();

  function allerVers(href: string) {
    fermer();
    router.push(href);
  }

  return (
    <div className={`fixed inset-0 z-30 ${ouvert ? "" : "pointer-events-none"}`} aria-hidden={!ouvert}>
      <div
        onClick={fermer}
        className={`absolute inset-0 bg-slate-900/50 transition-opacity duration-300 ${ouvert ? "opacity-100" : "opacity-0"}`}
      />

      <div
        className={`absolute inset-x-0 bottom-0 mx-auto w-full max-w-xl rounded-t-[2rem] bg-white pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-3 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] transition-transform duration-300 ${
          ouvert ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <button type="button" onClick={fermer} aria-label="Fermer" className="mx-auto block h-1.5 w-10 rounded-full bg-brand-line" />

        <h2 className="mt-4 text-center text-base font-bold text-brand-ink">À votre service</h2>

        <div className="mt-5 grid grid-cols-3 gap-x-3 gap-y-6 px-6">
          {SERVICES.map((service) => (
            <button
              key={service.label}
              type="button"
              onClick={() => allerVers(service.href)}
              className="flex flex-col items-center gap-2"
            >
              <span className="flex h-[76px] w-[76px] items-center justify-center rounded-2xl" style={{ backgroundColor: service.bg }}>
                <service.Icone className="h-8 w-8" style={{ color: service.couleur }} />
              </span>
              <span className="text-center text-xs font-medium text-brand-ink">{service.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
