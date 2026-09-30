"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useServiceSheet } from "@/context/ServiceSheetContext";

type ServiceTile = {
  label: string;
  image: string;
  bg: string;
  href: string;
  photo?: boolean;
};

const SERVICES: ServiceTile[] = [
  { label: "Maintenance", image: "/images/maintenance.png", bg: "#FCF1DC", href: "/service/maintenance" },
  { label: "Logiciels", image: "/images/informatique.png", bg: "#DCEFFB", href: "/market-space?categorie=logiciels" },
  { label: "Asistances", image: "/images/soutien-technique.png", bg: "#DFF5E9", href: "/service/assistances" },
  { label: "GarantiX", image: "/images/garantix.png", bg: "#E8F0FE", href: "/service/garantix" },
  { label: "Déclarer une panne", image: "/images/declare_panne.png", bg: "#FBE1E1", href: "/service/declarer-panne" },
  { label: "Service après-vente", image: "/images/service-apres-vente.svg", bg: "#E0F7F0", href: "/service/apres-vente" },
  { label: "Aide rapide", image: "/images/support-agent.png", bg: "#EAE6FB", href: "/profil/aide", photo: true },
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
              <span className="relative flex h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-2xl" style={{ backgroundColor: service.bg }}>
                <Image
                  src={service.image}
                  alt=""
                  fill
                  unoptimized={!service.photo}
                  className={service.photo ? "object-cover" : "object-contain p-4"}
                  sizes="76px"
                />
              </span>
              <span className="text-center text-xs font-medium text-brand-ink">{service.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
