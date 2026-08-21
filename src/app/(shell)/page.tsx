"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formaterDate, type Achat, type Pagination, type Privilege, type Tutoriel } from "@/lib/types";
import { GarantieBadgeIcon, PlayIcon, TagIcon } from "@/components/icons";
import { degradePrivilege, tagPrivilege, valeurAffichee } from "./privilege/data";

type ProfilResume = { prenom: string | null; nom: string; created_at: string };

const COUVERTURE_TUTORIEL_PAR_DEFAUT = "/images/couverture_tutoriel_astuce.png";

function couvertureTutoriel(tutoriel: Tutoriel): string {
  if (tutoriel.image_couverture) return tutoriel.image_couverture;
  if (tutoriel.id_video_youtube) return `https://i.ytimg.com/vi/${tutoriel.id_video_youtube}/hqdefault.jpg`;
  return COUVERTURE_TUTORIEL_PAR_DEFAUT;
}

function joursEntre(debut: Date, fin: Date): number {
  return Math.max(0, Math.ceil((fin.getTime() - debut.getTime()) / (1000 * 60 * 60 * 24)));
}

export default function AccueilPage() {
  const { token, pret } = useAuth();
  const [profil, setProfil] = useState<ProfilResume | null>(null);
  const [achats, setAchats] = useState<Achat[] | null>(null);
  const [privileges, setPrivileges] = useState<Privilege[] | null>(null);
  const [tutoriels, setTutoriels] = useState<Tutoriel[] | null>(null);

  useEffect(() => {
    if (!pret || !token) return;

    apiFetch<ProfilResume>("/moi/profil", { token }).then(setProfil);
    apiFetch<Pagination<Achat>>("/moi/achats", { token }).then((page) => setAchats(page.data));
    apiFetch<Privilege[]>("/privileges", { token }).then(setPrivileges);
    apiFetch<Pagination<Tutoriel>>("/tutoriels?per_page=100", { token }).then((page) => setTutoriels(page.data));
  }, [pret, token]);

  const garantieVedette = useMemo(() => {
    const achat = achats?.[0];
    if (!achat) return null;

    const debut = new Date(achat.garantie.date_debut);
    const fin = new Date(achat.garantie.date_fin);

    return {
      joursTotal: joursEntre(debut, fin),
      joursRestants: joursEntre(new Date(), fin),
    };
  }, [achats]);

  const privilegeVedette = privileges?.[0] ?? null;
  const tutorielVedette = tutoriels?.[0] ?? null;
  const nomComplet = profil ? `${profil.prenom ?? ""} ${profil.nom}`.trim() : "";

  return (
    <main className="pb-6">
      {/* En-tête dégradé bleu — coins bas arrondis pour laisser apparaître
          une bordure bleue de part et d'autre de la carte blanche. */}
      <section className="bg-gradient-brand-blue rounded-b-[2.5rem] px-5 pb-14 pt-6 text-white">
        <h1 className="text-lg font-bold">Ordi&apos;Space</h1>
      </section>

      {/* Carte blanche de bienvenue, chevauche l'en-tête. La mascotte déborde
          volontairement au-dessus de la carte, décalée à droite pour ne pas
          couvrir le badge cadeau. */}
      <section className="relative -mt-10 px-4">
        <div className="relative rounded-3xl bg-white shadow-lg shadow-blue-100">
          <Image
            src="/images/mascotte.png"
            alt="Mascotte Ordi'Space"
            width={203}
            height={202}
            className="pointer-events-none absolute z-10 h-[202px] w-[203px] object-contain"
            style={{ top: -55, right: -22 }}
            priority
          />

          <div className="p-5">
            <p className="text-xl font-bold text-brand-ink">
              Bonjour, {nomComplet || "…"} <span aria-hidden>👋</span>
            </p>
            <p className="mt-0.5 max-w-[65%] text-sm text-brand-muted">
              Bienvenue dans ton ordi&apos;Space
            </p>

            <p className="mt-3 inline-flex max-w-[75%] items-center gap-1.5 rounded-xl bg-brand-pink-bg px-3 py-2 text-xs font-medium text-brand-pink-text">
              <span aria-hidden>🎁</span>
              Tu bénéficies d&apos;un cadeau spécial Aujourd&apos;hui
            </p>

            {profil ? (
              <p className="mt-3 text-xs text-brand-muted">Membre depuis {formaterDate(profil.created_at)}</p>
            ) : null}
          </div>
        </div>
      </section>

      {/* Trois raccourcis — dimensions et couleurs figées (Figma) */}
      <section className="mt-4 flex justify-between gap-2 px-4">
        <Link
          href="/mes-achats"
          className="flex h-[116px] w-[108.66px] flex-col items-center justify-center gap-2 rounded-[25px] border-[3px] border-white/20 text-center text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #00807C 0%, #38EF7D 100%)" }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/90">
            <GarantieBadgeIcon className="h-5 w-5" />
          </span>
          <span className="text-xs font-semibold leading-tight">Garantie</span>
          <span className="text-[11px] text-white/85">
            {garantieVedette ? `${garantieVedette.joursRestants}/${garantieVedette.joursTotal} jours` : "—"}
          </span>
        </Link>

        <Link
          href="/privilege"
          className="flex h-[116px] w-[108.66px] flex-col items-center justify-center gap-2 rounded-[25px] border-[3px] border-white/20 text-center text-white shadow-sm"
          style={{ background: "linear-gradient(135deg, #F12711 0%, #F5AF19 100%)" }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/25">
            <TagIcon className="h-5 w-5" />
          </span>
          <span className="text-xs font-semibold leading-tight">Carte de fidélité</span>
        </Link>

        <Link
          href="/profil/aide"
          className="relative flex h-[116px] w-[108.66px] flex-col items-center justify-center gap-2 rounded-[25px] border-[3px] border-white/20 text-center text-white shadow-sm"
          style={{ background: "linear-gradient(90deg, #0077FF 0%, #00BFFF 100%)" }}
        >
          <span className="relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-white/25">
            <Image src="/images/support-agent.png" alt="Agent support" width={44} height={44} className="h-full w-full object-cover" />
          </span>
          <span className="text-xs font-semibold leading-tight">Aide rapide</span>
        </Link>
      </section>

      {/* Carte privilège vedette */}
      {privilegeVedette ? (
        <section className="mt-4 px-4">
          <Link
            href={`/privilege/${privilegeVedette.id}`}
            className="relative block overflow-hidden rounded-3xl p-5 text-white shadow-md"
            style={{ background: degradePrivilege(privilegeVedette) }}
          >
            <TagIcon className="pointer-events-none absolute right-4 top-4 h-16 w-16 text-white/25" />
            <p className="text-sm font-semibold">{privilegeVedette.titre}</p>
            <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-[11px]">
              {tagPrivilege(privilegeVedette)}
            </span>
            <p className="mt-3 text-4xl font-extrabold">{valeurAffichee(privilegeVedette)}</p>
            {privilegeVedette.description ? (
              <p className="mt-2 max-w-[80%] text-xs text-white/90">{privilegeVedette.description}</p>
            ) : null}
          </Link>
        </section>
      ) : null}

      {/* Vidéo / astuce en vedette */}
      {tutorielVedette ? (
        <section className="mt-4 px-4">
          <Link
            href={`/academy/${tutorielVedette.id}`}
            className="block overflow-hidden rounded-3xl bg-[#12131a] text-white shadow-md"
          >
            <div className="relative aspect-[16/10]">
              <Image
                src={couvertureTutoriel(tutorielVedette)}
                alt={tutorielVedette.titre}
                fill
                className="object-cover"
                sizes="(max-width: 480px) 100vw, 402px"
              />

              <span className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#12131a]">
                <PlayIcon className="h-5 w-5" />
              </span>
            </div>
          </Link>

          <div className="mt-2 flex items-center justify-between">
            <p className="truncate text-sm text-brand-ink">{tutorielVedette.titre}</p>
            <Link
              href="/academy"
              className="flex h-[23px] w-[94px] shrink-0 items-center justify-center whitespace-nowrap rounded-[11.5px] border border-brand-line text-center text-[8.5px] font-medium text-brand-muted"
            >
              Voir d&apos;autres vidéos
            </Link>
          </div>
        </section>
      ) : null}
    </main>
  );
}
