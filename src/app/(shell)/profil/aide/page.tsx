"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch, ApiRequestError } from "@/lib/api";
import { formaterDate, type Achat, type MessageAssistantIa, type Pagination } from "@/lib/types";
import { ChevronLeftIcon, MicIcon, SendIcon } from "@/components/icons";

type MessageAffiche =
  | { id: string; type: "accueil"; texte: string }
  | { id: string; type: "client" | "assistant"; texte: string };

function texteAccueil(prenom: string, dernierAchat: Achat | null): string {
  const contexteAchat = dernierAchat
    ? `Dis-moi, as-tu des questions concernant l'utilisation de ton ordinateur ${dernierAchat.produit.nom_produit}, que tu as acheté le ${formaterDate(dernierAchat.commande.date_commande)} ?`
    : "Dis-moi, as-tu des questions concernant nos produits ou nos services ?";

  return `${contexteAchat}\n\nOu peut-être as-tu d'autres préoccupations ou besoins ? Je suis à ta disposition et je t'écoute.`;
}

function BulleAccueil({ prenom, texte }: { prenom: string; texte: string }) {
  const paragraphes = texte.split("\n\n");

  return (
    <div className="rounded-3xl bg-white px-5 py-4 text-sm leading-relaxed text-brand-ink shadow-sm">
      <p>
        Bonjour, <span className="font-bold">{prenom}</span>, Je suis{" "}
        <span className="font-bold text-[color:var(--brand-blue-end)]">Ellah</span>, disponible pour répondre à toutes
        tes questions.
      </p>
      {paragraphes.map((paragraphe, index) => (
        <p key={index} className="mt-3">
          {paragraphe}
        </p>
      ))}
    </div>
  );
}

function BulleTypage() {
  return (
    <div className="flex items-center gap-1.5 rounded-3xl bg-white px-5 py-4 shadow-sm">
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-muted [animation-delay:-0.3s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-muted [animation-delay:-0.15s]" />
      <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-brand-muted" />
    </div>
  );
}

type ReconnaissanceVocale = {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  start(): void;
  stop(): void;
  onresult: ((event: { results: { transcript: string }[][] } & Event) => void) | null;
  onerror: (() => void) | null;
  onend: (() => void) | null;
};

type FenetreAvecReconnaissanceVocale = Window & {
  SpeechRecognition?: new () => ReconnaissanceVocale;
  webkitSpeechRecognition?: new () => ReconnaissanceVocale;
};

export default function AideRapidePage() {
  const { user, token, pret } = useAuth();
  const [dernierAchat, setDernierAchat] = useState<Achat | null>(null);
  const [achatsCharges, setAchatsCharges] = useState(false);
  const [historique, setHistorique] = useState<MessageAssistantIa[] | null>(null);
  const [brouillon, setBrouillon] = useState("");
  const [envoiEnCours, setEnvoiEnCours] = useState(false);
  const [enEcoute, setEnEcoute] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const finDeListe = useRef<HTMLDivElement>(null);
  const reconnaissanceRef = useRef<ReconnaissanceVocale | null>(null);

  useEffect(() => {
    // Tant que la session n'est pas hydratée, "token" peut valoir null de
    // façon transitoire — attendre "pret" évite de conclure trop tôt à
    // l'absence d'achat et de figer le message d'accueil générique.
    if (!pret) return;

    if (!token) {
      setAchatsCharges(true);
      return;
    }

    apiFetch<Pagination<Achat>>("/moi/achats", { token })
      .then((page) => setDernierAchat(page.data[0] ?? null))
      .catch(() => setDernierAchat(null))
      .finally(() => setAchatsCharges(true));

    apiFetch<MessageAssistantIa[]>("/assistant/messages", { token })
      .then(setHistorique)
      .catch(() => setHistorique([]));
  }, [pret, token]);

  useEffect(() => {
    finDeListe.current?.scrollIntoView({ behavior: "smooth" });
  }, [historique, envoiEnCours]);

  const prenomAffiche = useMemo(() => user?.prenom ?? user?.nom ?? "", [user]);

  const messagesAffiches: MessageAffiche[] = useMemo(() => {
    if (!achatsCharges) return [];

    const base: MessageAffiche[] =
      historique && historique.length > 0
        ? []
        : [{ id: "accueil", type: "accueil", texte: texteAccueil(prenomAffiche, dernierAchat) }];

    const reels: MessageAffiche[] = (historique ?? []).map((m) => ({
      id: String(m.id),
      type: m.role,
      texte: m.contenu,
    }));

    return [...base, ...reels];
  }, [achatsCharges, historique, prenomAffiche, dernierAchat]);

  async function envoyerMessage() {
    const texte = brouillon.trim();
    if (!texte || !token || envoiEnCours) return;

    setErreur(null);
    setBrouillon("");
    setEnvoiEnCours(true);

    // Affichage optimiste du message du client pendant l'attente de la réponse.
    const messageOptimiste: MessageAssistantIa = {
      id: -Date.now(),
      role: "client",
      contenu: texte,
      date_envoi: new Date().toISOString(),
    };
    setHistorique((precedent) => [...(precedent ?? []), messageOptimiste]);

    try {
      const reponse = await apiFetch<{ message_client: MessageAssistantIa; message_assistant: MessageAssistantIa }>(
        "/assistant/messages",
        { method: "POST", token, body: { message: texte } }
      );

      setHistorique((precedent) => [
        ...(precedent ?? []).filter((m) => m.id !== messageOptimiste.id),
        reponse.message_client,
        reponse.message_assistant,
      ]);
    } catch (e) {
      setHistorique((precedent) => (precedent ?? []).filter((m) => m.id !== messageOptimiste.id));
      setBrouillon(texte);
      setErreur(e instanceof ApiRequestError ? e.message : "Impossible de contacter l'assistant pour le moment.");
    } finally {
      setEnvoiEnCours(false);
    }
  }

  function basculerDictee() {
    if (enEcoute) {
      reconnaissanceRef.current?.stop();
      return;
    }

    const fenetre = window as FenetreAvecReconnaissanceVocale;
    const ConstructeurReconnaissance = fenetre.SpeechRecognition ?? fenetre.webkitSpeechRecognition;

    if (!ConstructeurReconnaissance) {
      setErreur("La dictée vocale n'est pas prise en charge par ce navigateur.");
      return;
    }

    setErreur(null);
    const reconnaissance = new ConstructeurReconnaissance();
    reconnaissance.lang = "fr-FR";
    reconnaissance.interimResults = false;
    reconnaissance.maxAlternatives = 1;

    reconnaissance.onresult = (event) => {
      const texte = event.results[0]?.[0]?.transcript;
      if (texte) {
        setBrouillon((precedent) => (precedent.trim() ? `${precedent.trim()} ${texte}` : texte));
      }
    };
    reconnaissance.onerror = () => {
      setErreur("La dictée vocale a été interrompue. Réessaie.");
      setEnEcoute(false);
    };
    reconnaissance.onend = () => setEnEcoute(false);

    reconnaissanceRef.current = reconnaissance;
    reconnaissance.start();
    setEnEcoute(true);
  }

  return (
    <main className="flex min-h-full flex-col pb-24">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-brand-ink">
          <span className="text-[color:var(--brand-blue-end)]">Ai</span>de rapide
        </h1>
      </div>

      <div className="mt-6 flex justify-center">
        <div className="flex h-[130px] w-[130px] items-center justify-center rounded-full bg-[color:var(--brand-blue-end)]/10">
          <div className="bg-gradient-brand-blue flex h-[104px] w-[104px] items-center justify-center rounded-full p-[3px]">
            <div className="relative h-full w-full overflow-hidden rounded-full ring-4 ring-white">
              <Image src="/images/support-agent.png" alt="Ellah" fill className="object-cover" sizes="98px" />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-1 flex-col gap-3 px-5">
        {messagesAffiches.map((message) => {
          if (message.type === "accueil") {
            return <BulleAccueil key={message.id} prenom={prenomAffiche} texte={message.texte} />;
          }

          if (message.type === "client") {
            return (
              <div key={message.id} className="flex justify-end">
                <p className="bg-gradient-brand-blue max-w-[80%] rounded-3xl rounded-tr-md px-4 py-2.5 text-sm text-white shadow-sm">
                  {message.texte}
                </p>
              </div>
            );
          }

          return (
            <div key={message.id} className="whitespace-pre-line rounded-3xl rounded-tl-md bg-white px-5 py-4 text-sm leading-relaxed text-brand-ink shadow-sm">
              {message.texte}
            </div>
          );
        })}

        {envoiEnCours ? <BulleTypage /> : null}
        {erreur ? <p className="text-center text-xs text-rose-500">{erreur}</p> : null}

        <div ref={finDeListe} />
      </div>

      <div className="fixed inset-x-0 bottom-[64px] z-20 mx-auto w-full max-w-xl px-4 pb-3">
        <div className="flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg shadow-slate-200/70">
          <input
            value={brouillon}
            onChange={(e) => setBrouillon(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") envoyerMessage();
            }}
            disabled={envoiEnCours}
            placeholder={enEcoute ? "Je t'écoute…" : "Écris ton message"}
            className="h-9 flex-1 bg-transparent text-sm text-brand-ink outline-none placeholder:text-brand-muted disabled:opacity-60"
          />
          <button
            type="button"
            onClick={basculerDictee}
            disabled={envoiEnCours}
            className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors disabled:opacity-40 ${
              enEcoute ? "animate-pulse bg-rose-500 text-white" : "text-brand-muted"
            }`}
            aria-label={enEcoute ? "Arrêter la dictée" : "Message vocal"}
          >
            <MicIcon className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={envoyerMessage}
            disabled={!brouillon.trim() || envoiEnCours}
            className="flex h-8 w-8 items-center justify-center text-[color:var(--brand-blue-end)] disabled:opacity-40"
            aria-label="Envoyer"
          >
            <SendIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
    </main>
  );
}
