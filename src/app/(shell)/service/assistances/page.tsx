"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { Pagination, QuestionFrequente } from "@/lib/types";
import { ChevronLeftIcon, PauseIcon, PlayIcon } from "@/components/icons";

const DEGRADE_APPEL = "linear-gradient(270deg, #00BFFF 0%, #0077FF 100%)";
const DEGRADE_WHATSAPP = "linear-gradient(93.35deg, #36CE00 0%, #00D8A4 118.39%)";

function formaterDuree(secondes: number): string {
  if (!Number.isFinite(secondes)) return "0:00";
  const min = Math.floor(secondes / 60);
  const sec = Math.floor(secondes % 60);
  return `${min}:${sec.toString().padStart(2, "0")}`;
}

export default function AssistancesPage() {
  const router = useRouter();
  const { token, pret } = useAuth();

  const [questions, setQuestions] = useState<QuestionFrequente[] | null>(null);
  const [questionActiveId, setQuestionActiveId] = useState<number | null>(null);
  const [enLecture, setEnLecture] = useState(false);
  const [temps, setTemps] = useState(0);
  const [duree, setDuree] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pagination<QuestionFrequente>>("/assistance/questions", { token }).then((page) => {
      setQuestions(page.data);
      setQuestionActiveId(page.data[0]?.id ?? null);
    });
  }, [token]);

  const questionActive = questions?.find((q) => q.id === questionActiveId) ?? null;

  useEffect(() => {
    setEnLecture(false);
    setTemps(0);
    setDuree(0);
  }, [questionActiveId]);

  function basculerLecture() {
    const audio = audioRef.current;
    if (!audio) return;

    if (enLecture) {
      audio.pause();
    } else {
      audio.play();
    }
  }

  return (
    <main className="min-h-full pb-10">
      <div className="bg-gradient-brand-blue relative rounded-b-[2rem] px-4 pb-5 pt-4">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <ChevronLeftIcon className="h-5 w-5 text-white" />
          </button>
          <h1 className="absolute inset-x-0 text-center text-base font-bold text-white">Service d&apos;assistance</h1>
        </div>

        <div className="relative mt-3 h-36 w-full overflow-hidden rounded-2xl">
          <Image src="/images/banner-assistance.png" alt="" fill className="object-cover" priority />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 px-4">
        <div className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-sm">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-50">
            <Image src="/images/soutien-technique.png" alt="" width={40} height={40} />
          </span>
          <p className="mt-3 text-sm font-bold text-brand-ink">Services après vente</p>
          <p className="mt-1 text-[11px] text-brand-muted">Disponible pour répondre à tous vos préoccupations</p>

          <div className="mt-4 flex flex-col items-center gap-2">
            <a
              href="tel:+2250000000000"
              className="flex h-[29px] w-[135px] items-center justify-center gap-2 rounded-[27.5px] text-[11px] font-semibold text-white"
              style={{ backgroundImage: DEGRADE_APPEL }}
            >
              <Image src="/images/icon-telephone.png" alt="" width={14} height={14} />
              Appelle
            </a>
            <a
              href="https://wa.me/2250000000000"
              target="_blank"
              rel="noreferrer"
              className="flex h-[29px] w-[135px] items-center justify-center gap-2 rounded-[27.5px] text-[11px] font-semibold text-white"
              style={{ backgroundImage: DEGRADE_WHATSAPP }}
            >
              <Image src="/images/icon-WhatsApp.png" alt="" width={14} height={14} />
              WhatsApp
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center rounded-2xl bg-white p-4 text-center shadow-sm">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
            <Image src="/images/garantix.png" alt="" width={40} height={40} />
          </span>
          <p className="mt-3 text-sm font-bold text-brand-ink">Services garanties</p>
          <p className="mt-1 text-[11px] text-brand-muted">Disponible pour répondre aux préoccupations liées à vos garanties</p>

          <div className="mt-4 flex flex-col items-center gap-2">
            <a
              href="tel:+2250000000000"
              className="flex h-[29px] w-[135px] items-center justify-center gap-2 rounded-[27.5px] text-[11px] font-semibold text-white"
              style={{ backgroundImage: DEGRADE_APPEL }}
            >
              <Image src="/images/icon-telephone.png" alt="" width={14} height={14} />
              Appelle
            </a>
            <a
              href="https://wa.me/2250000000000"
              target="_blank"
              rel="noreferrer"
              className="flex h-[29px] w-[135px] items-center justify-center gap-2 rounded-[27.5px] text-[11px] font-semibold text-white"
              style={{ backgroundImage: DEGRADE_WHATSAPP }}
            >
              <Image src="/images/icon-WhatsApp.png" alt="" width={14} height={14} />
              WhatsApp
            </a>
          </div>
        </div>
      </div>

      <div className="mt-3 px-4">
        <div className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex-1">
            <p className="text-sm font-bold text-brand-ink">
              <span className="text-[color:var(--brand-blue-end)]">Ai</span>de rapide
            </p>
            <p className="mt-1 text-[11px] text-brand-muted">
              Disponible pour répondre à toutes vos questions liées à l&apos;utilisation de votre ordinateur ou accessoires
            </p>
          </div>

          <div className="flex flex-col items-center gap-2">
            <Image src="/images/icon-messagerie.png" alt="" width={44} height={44} />
            <Link
              href="/profil/aide"
              className="flex h-[29px] w-[145px] items-center justify-center rounded-[27.5px] text-[11px] font-semibold text-white"
              style={{ backgroundImage: DEGRADE_APPEL }}
            >
              Commencer maintenant
            </Link>
          </div>
        </div>
      </div>

      <div className="mt-6 px-4">
        <p className="text-sm font-bold text-brand-ink">Question fréquente</p>

        {!pret || (token && questions === null) ? (
          <p className="mt-4 text-center text-sm text-brand-muted">Chargement…</p>
        ) : !token ? (
          <p className="mt-4 text-center text-sm text-brand-muted">Connectez-vous pour écouter les questions fréquentes.</p>
        ) : questions && questions.length === 0 ? (
          <p className="mt-4 text-center text-sm text-brand-muted">Aucune question fréquente disponible pour le moment.</p>
        ) : questionActive ? (
          <>
            <div className="bg-gradient-brand-blue relative mt-3 overflow-hidden rounded-3xl p-5 pb-6 text-white">
              <p className="max-w-[60%] text-sm font-bold leading-snug">{questionActive.question}</p>
              {questionActive.reponse ? (
                <p className="relative z-10 mt-2 max-w-[60%] text-[11px] leading-relaxed text-white/80">{questionActive.reponse}</p>
              ) : null}

              {questionActive.fichier_audio ? (
                <>
                  <audio
                    ref={audioRef}
                    src={questionActive.fichier_audio}
                    preload="metadata"
                    onPlay={() => setEnLecture(true)}
                    onPause={() => setEnLecture(false)}
                    onEnded={() => setEnLecture(false)}
                    onLoadedMetadata={(e) => setDuree(e.currentTarget.duration)}
                    onTimeUpdate={(e) => setTemps(e.currentTarget.currentTime)}
                  />

                  <div className="mt-6 flex h-[37px] w-[226px] items-center gap-2 rounded-[20px] bg-white px-3">
                    <button
                      type="button"
                      onClick={basculerLecture}
                      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white"
                      style={{ backgroundImage: DEGRADE_APPEL }}
                    >
                      {enLecture ? <PauseIcon className="h-3 w-3" /> : <PlayIcon className="h-3 w-3" />}
                    </button>
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{ backgroundImage: DEGRADE_APPEL, width: duree > 0 ? `${Math.min(100, (temps / duree) * 100)}%` : "0%" }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold text-brand-ink">{formaterDuree(duree > 0 ? duree - temps : 0)}</span>
                  </div>
                </>
              ) : (
                <p className="relative z-10 mt-6 text-[11px] font-medium text-white/70">Aucun audio disponible pour cette question.</p>
              )}

              <div className="pointer-events-none absolute -bottom-2 right-0 h-32 w-32">
                <Image src="/images/mascotte.png" alt="" fill className="object-contain object-bottom" />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2">
              {questions?.map((question, index) => (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => setQuestionActiveId(question.id)}
                  className={`h-10 rounded-full text-xs font-semibold transition-colors ${
                    questionActiveId === question.id
                      ? "bg-gradient-brand-blue text-white shadow-md shadow-blue-200"
                      : "bg-white text-[color:var(--brand-blue-end)] shadow-sm"
                  }`}
                >
                  Question {index + 1}
                </button>
              ))}
            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
