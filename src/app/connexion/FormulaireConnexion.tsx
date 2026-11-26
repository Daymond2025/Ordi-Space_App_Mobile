"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import { useAuth } from "@/context/AuthContext";
import { ApiRequestError } from "@/lib/api";
import { CadreAuth, salutation } from "@/components/auth/kit/CadreAuth";
import { ChampFlottant, IconeTelephone } from "@/components/auth/kit/ChampFlottant";
import { BadgeSecurite, BoutonAuth, BoutonRetour, MessageErreur } from "@/components/auth/kit/BoutonAuth";
import type { HumeurMascotte } from "@/components/auth/kit/MascotteVivante";
import { THEME_AUTH } from "@/components/auth/kit/themeAuth";
import { useRetour } from "@/lib/navigation";

/**
 * Connexion par numéro + code WhatsApp. Numéro inconnu : création du compte
 * (/inscription). `next` : page à rouvrir une fois connecté.
 */
export function FormulaireConnexion() {
  const { demanderOtp } = useAuth();
  const router = useRouter();
  // Retour fiable même si la page a été ouverte directement (notification, lien, appli rouverte) — voir lib/navigation.ts.
  const retour = useRetour("/");
  const searchParams = useSearchParams();
  const r = THEME_AUTH.repliques;

  const [telephone, setTelephone] = useState(() => (searchParams.get("telephone") ?? "").replace(/^\+225/, ""));
  const [erreur, setErreur] = useState<string | null>(null);
  const [compteurErreurs, setCompteurErreurs] = useState(0);
  const [chargement, setChargement] = useState(false);
  const [focus, setFocus] = useState(false);
  const [accueil, setAccueil] = useState(true);
  const numeroValide = telephone.replace(/\D/g, "").length >= 10;

  useEffect(() => {
    const t = setTimeout(() => setAccueil(false), 2600);
    return () => clearTimeout(t);
  }, []);

  function signaler(message: string) {
    setErreur(message);
    setCompteurErreurs((n) => n + 1);
    navigator.vibrate?.(120);
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setErreur(null);

    if (!telephone.trim()) {
      signaler("Entre ton numéro whatsapp.");
      return;
    }

    setChargement(true);
    try {
      const resultat = await demanderOtp(telephone);
      const suite = searchParams.get("next");
      const params = new URLSearchParams({ telephone });
      if (suite) params.set("next", suite);

      if (resultat.compteExistant && resultat.userId) {
        params.set("user_id", String(resultat.userId));
        if (resultat.codeDebug) params.set("code_debug", resultat.codeDebug);
        router.push(`/connexion/verification?${params.toString()}`);
      } else {
        router.push(`/inscription?${params.toString()}`);
      }
    } catch (e) {
      signaler(e instanceof ApiRequestError ? e.message : "Impossible de se connecter. Vérifiez votre connexion internet.");
    } finally {
      setChargement(false);
    }
  }

  let humeur: HumeurMascotte = "repos";
  let bulle = r.repos;
  if (erreur) {
    humeur = "erreur";
    bulle = r.erreur;
  } else if (focus) {
    humeur = "saisie";
    bulle = numeroValide ? r.telephoneOk : r.telephone;
  } else if (accueil) {
    humeur = "salut";
    bulle = `${salutation()} ! ${r.salut}`;
  }

  return (
    <CadreAuth humeur={humeur} bulle={bulle} declencheur={compteurErreurs}>
      <form onSubmit={onSubmit} className="flex flex-1 flex-col" noValidate>
        <BoutonRetour onClick={retour} />
        <h2 className="mt-3 text-center text-3xl font-black text-slate-900">Connexion</h2>
        <p className="mt-1.5 text-center text-sm text-slate-500">Entre ton numéro WhatsApp : on t&apos;envoie un code. Pas encore de compte ? On le crée ensemble.</p>

        <div className="mt-7">
          <ChampFlottant
            type="tel"
            label="Numéro WhatsApp"
            value={telephone}
            onChange={(v) => {
              setTelephone(v);
              setErreur(null);
            }}
            icone={<IconeTelephone />}
            indicatif
            valide={numeroValide}
            enErreur={Boolean(erreur)}
            declencheurErreur={compteurErreurs}
            autoComplete="tel-national"
            onFocus={() => setFocus(true)}
            onBlur={() => setFocus(false)}
          />
        </div>

        <MessageErreur erreur={erreur} />


        <BoutonAuth type="submit" chargement={chargement} texteChargement="Envoi du code…" className="mt-10">
          Recevoir mon code
        </BoutonAuth>

        <BadgeSecurite texte={THEME_AUTH.badge} />
      </form>
    </CadreAuth>
  );
}
