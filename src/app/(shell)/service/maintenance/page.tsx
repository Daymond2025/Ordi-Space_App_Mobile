"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRightIcon, TriangleAlerteIcon } from "@/components/icons";
import { POINTS_MAINTENANCE, STYLE_TAG_SERVICE } from "./data";

const DEGRADE_HEADER = "linear-gradient(105.59deg, #0C003F -28.56%, #0077FF 130.51%)";

export default function MaintenancePage() {
  return (
    <main className="bg-gradient-brand-blue relative min-h-full overflow-hidden pb-4">
      <Image
        src="/images/polycone.png"
        alt=""
        width={164}
        height={139}
        className="pointer-events-none absolute opacity-[0.34]"
        style={{ top: 601, left: 214, transform: "rotate(-27.05deg)" }}
      />
      <TriangleAlerteIcon className="pointer-events-none absolute -left-4 top-6 h-24 w-24 rotate-[6deg] text-white/10" />
      <TriangleAlerteIcon className="pointer-events-none absolute left-6 top-[26rem] h-20 w-20 rotate-[10deg] text-white/10" />
      <TriangleAlerteIcon className="pointer-events-none absolute right-4 bottom-24 h-24 w-24 rotate-[-6deg] text-white/10" />

      <div className="relative overflow-hidden rounded-b-[34px] px-5 pb-16 pt-5" style={{ backgroundImage: DEGRADE_HEADER }}>
        <p className="relative text-lg font-extrabold text-white">Ordi&apos;Space</p>

        <div className="relative mt-4 rounded-3xl border-2 border-sky-300 bg-white p-4 shadow-lg shadow-blue-900/10">
          <div className="max-w-[60%]">
            <h1 className="text-xl font-extrabold leading-snug text-brand-ink">Point de Maintenance</h1>
            <p className="mt-2 text-xs font-semibold text-[color:var(--brand-blue-end)]">Maintenance gratuit sous conditions</p>
            <Link
              href="/service/maintenance/conditions"
              className="bg-gradient-brand-blue mt-3 inline-flex h-8 items-center justify-center rounded-full px-4 text-xs font-semibold text-white"
            >
              Voir les conditions
            </Link>
          </div>
        </div>

        {/* Déborde au-dessus de la carte blanche, pour sembler posée sur le
            rectangle dégradé de l'en-tête. */}
        <div className="pointer-events-none absolute" style={{ width: 212, height: 212, top: 10, left: 188 }}>
          <Image src="/images/mascotte_panne.png" alt="" fill className="object-contain object-bottom" priority />
        </div>
      </div>

      <div className="relative -mt-10 flex flex-col gap-3 px-5">
        {POINTS_MAINTENANCE.map((point) => (
          <Link
            key={point.id}
            href={`/service/maintenance/${point.id}`}
            className="flex items-start gap-3 rounded-[20px] bg-white p-4 shadow-sm"
          >
            <div className="flex flex-col items-center gap-1">
              <span
                className="flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ backgroundColor: point.couleurIcone }}
              >
                <Image src="/images/locaisation.png" alt="" width={26} height={26} />
              </span>
              <span className="font-semibold text-[10px] leading-none text-brand-muted">
                {point.distanceKm} Km
              </span>
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[11px] text-brand-muted">Point de maintenance</p>
              <p className="text-sm font-bold text-brand-ink">{point.nom}</p>
              <p className="mt-0.5 text-xs text-brand-muted">{point.localisation}</p>

              <div className="mt-2 flex flex-nowrap gap-1">
                {point.services.map((service) => (
                  <span
                    key={service}
                    className={`whitespace-nowrap rounded-full px-1.5 py-0.5 text-[8px] font-normal leading-none ${STYLE_TAG_SERVICE[service] ?? "bg-brand-line text-brand-muted"}`}
                  >
                    {service}
                  </span>
                ))}
              </div>
            </div>

            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[color:var(--brand-blue-end)]">
              <ArrowUpRightIcon className="h-4 w-4" />
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
