"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { Pagination, Tutoriel } from "@/lib/types";
import { AcademyIcon, EyeIcon, PlayIcon } from "@/components/icons";

const COUVERTURE = "/images/couverture_tutoriel_astuce.png";

function couvertureTutoriel(tutoriel: Tutoriel): string {
  if (tutoriel.image_couverture) return tutoriel.image_couverture;
  if (tutoriel.id_video_youtube) return `https://i.ytimg.com/vi/${tutoriel.id_video_youtube}/hqdefault.jpg`;
  return COUVERTURE;
}

export function AcademyTabs() {
  const { token, pret } = useAuth();
  const [onglet, setOnglet] = useState<"rapide" | "formation">("rapide");
  const [tutoriels, setTutoriels] = useState<Tutoriel[] | null>(null);

  useEffect(() => {
    if (!pret || !token) return;
    apiFetch<Pagination<Tutoriel>>("/tutoriels?per_page=100", { token }).then((page) => setTutoriels(page.data));
  }, [pret, token]);

  const tutosRapides = tutoriels?.filter((t) => t.type === "tutoriel_rapide") ?? null;
  const formations = tutoriels?.filter((t) => t.type === "formation") ?? null;

  return (
    <div className="px-4">
      {/* Plateau blanc qui commence juste à la fin de la bordure basse de
          l'en-tête dégradé — pas de chevauchement dedans. Les tabs reposent dessus. */}
      <div className="relative z-10 -mx-4 rounded-[24px] bg-white px-[13px] py-4 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.25)]">
        <div className="flex h-11 rounded-full bg-white p-1 shadow-sm ring-1 ring-slate-100">
          <button
            type="button"
            onClick={() => setOnglet("rapide")}
            className={`flex-1 rounded-full text-sm font-semibold transition-colors ${
              onglet === "rapide" ? "bg-gradient-brand-blue text-white" : "text-brand-muted"
            }`}
          >
            Tutos rapide
          </button>
          <button
            type="button"
            onClick={() => setOnglet("formation")}
            className={`flex-1 rounded-full text-sm font-semibold transition-colors ${
              onglet === "formation" ? "bg-gradient-brand-blue text-white" : "text-brand-muted"
            }`}
          >
            Formation informatique
          </button>
        </div>
      </div>

      {onglet === "rapide" ? (
        tutosRapides === null ? (
          <p className="py-10 text-center text-sm text-brand-muted">Chargement…</p>
        ) : tutosRapides.length === 0 ? (
          <p className="py-10 text-center text-sm text-brand-muted">Aucun tuto rapide pour le moment.</p>
        ) : (
          <div className="mt-5 flex flex-col gap-4">
            {tutosRapides.map((tuto) => (
              <Link
                key={tuto.id}
                href={`/academy/${tuto.id}`}
                className="block rounded-[18px] bg-white px-2 pb-2 pt-[7px] shadow-[0px_10px_10px_10px_rgba(0,0,0,0.05)]"
              >
                <div className="relative aspect-[352/192] overflow-hidden rounded-[18px]">
                  <Image src={couvertureTutoriel(tuto)} alt="" fill className="object-cover" sizes="(max-width: 480px) 100vw, 366px" />
                  {tuto.id_video_youtube ? (
                    <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-brand-ink">
                        <PlayIcon className="h-5 w-5" />
                      </span>
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between pt-2">
                  <p className="truncate text-sm font-medium text-brand-ink">{tuto.titre}</p>
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-line text-brand-muted">
                    <EyeIcon className="h-4 w-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )
      ) : formations === null ? (
        <p className="py-10 text-center text-sm text-brand-muted">Chargement…</p>
      ) : formations.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[22px] bg-white px-6 py-12 text-center shadow-sm">
          <span className="bg-gradient-brand-blue flex h-16 w-16 items-center justify-center rounded-full text-white">
            <AcademyIcon className="h-7 w-7" />
          </span>
          <p className="mt-4 text-base font-bold text-brand-ink">Aucune formation pour le moment</p>
          <p className="mt-1.5 max-w-[26rem] text-sm text-brand-muted">
            De nouvelles formations informatiques arrivent bientôt. Reviens régulièrement pour ne rien manquer.
          </p>
        </div>
      ) : (
        <div className="mt-5 flex flex-col gap-4">
          {formations.map((formation) => (
            <Link
              key={formation.id}
              href={`/academy/${formation.id}`}
              className="block rounded-[18px] bg-white px-2 pb-2 pt-[7px] shadow-[0px_10px_10px_10px_rgba(0,0,0,0.05)]"
            >
              <div className="relative aspect-[352/192] overflow-hidden rounded-[18px]">
                <Image src={couvertureTutoriel(formation)} alt="" fill className="object-cover" sizes="(max-width: 480px) 100vw, 366px" />
                {formation.id_video_youtube ? (
                  <span className="absolute inset-0 flex items-center justify-center bg-black/10">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/90 text-brand-ink">
                      <PlayIcon className="h-5 w-5" />
                    </span>
                  </span>
                ) : null}
              </div>
              <div className="flex items-center justify-between pt-2">
                <p className="truncate text-sm font-medium text-brand-ink">{formation.titre}</p>
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-line text-brand-muted">
                  <EyeIcon className="h-4 w-4" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
