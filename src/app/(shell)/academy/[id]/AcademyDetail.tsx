"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { Tutoriel } from "@/lib/types";
import { ChevronLeftIcon } from "@/components/icons";

const COUVERTURE = "/images/couverture_tutoriel_astuce.png";

export function AcademyDetail({ id }: { id: string }) {
  const { token, pret } = useAuth();
  const [tutoriel, setTutoriel] = useState<Tutoriel | null | undefined>(undefined);

  useEffect(() => {
    if (!pret || !token) return;
    apiFetch<Tutoriel>(`/tutoriels/${id}`, { token })
      .then((donnees) => {
        setTutoriel(donnees);
        // Suivi individuel Academy Space : signale au backend que ce client
        // a consulté ce contenu (alimente sa fiche admin), en tâche de fond.
        apiFetch(`/tutoriels/${id}/vu`, { method: "POST", token }).catch(() => {});
      })
      .catch(() => setTutoriel(null));
  }, [pret, token, id]);

  if (tutoriel === undefined) {
    return <p className="px-4 py-6 text-sm text-brand-muted">Chargement…</p>;
  }

  if (tutoriel === null) {
    return (
      <main className="min-h-full">
        <div className="flex items-center gap-3 px-4 pt-4">
          <Link href="/academy" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
        </div>
        <p className="px-4 pt-6 text-sm text-brand-muted">Ce contenu n&apos;est plus disponible.</p>
      </main>
    );
  }

  return (
    <main className="min-h-full pb-10">
      <div className="relative aspect-video w-full bg-black">
        {tutoriel.id_video_youtube ? (
          <iframe
            src={`https://www.youtube.com/embed/${tutoriel.id_video_youtube}?autoplay=1&mute=1&playsinline=1&rel=0`}
            title={tutoriel.titre}
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full"
          />
        ) : (
          <Image src={tutoriel.image_couverture ?? COUVERTURE} alt="" fill className="object-cover" sizes="100vw" />
        )}
        <Link
          href="/academy"
          className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-white/90 shadow-sm"
        >
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
      </div>

      <div className="px-4 pt-4">
        <h1 className="text-xl font-bold text-brand-ink">{tutoriel.titre}</h1>

        {tutoriel.contenu ? (
          <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-brand-muted">{tutoriel.contenu}</p>
        ) : null}
      </div>
    </main>
  );
}
