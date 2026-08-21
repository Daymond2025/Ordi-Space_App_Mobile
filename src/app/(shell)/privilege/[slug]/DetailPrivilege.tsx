"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { ChevronLeftIcon } from "@/components/icons";
import type { Privilege } from "@/lib/types";
import { commentCaMarche, conditionPrivilege, degradePrivilege, iconePrivilege, tagPrivilege, valeurAffichee } from "../data";

type ProfilAvecParrainage = { code_parrainage?: string };

function BoiteCode({ code, copiable }: { code: string; copiable: boolean }) {
  const [copie, setCopie] = useState(false);

  async function copierLeCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Clipboard indisponible (contexte non sécurisé, permission refusée…) —
      // le code reste visible à l'écran, l'utilisateur peut le copier à la main.
    }
  }

  return (
    <div className="mt-5 flex items-center gap-3 px-5">
      <div className="flex flex-1 items-center gap-3 rounded-2xl bg-white px-4 py-3 text-[#12131a] shadow-md">
        <Image src="/images/icon-cadeux.png" alt="" width={36} height={36} />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">Code</p>
          <p className="text-base font-bold">{code}</p>
        </div>
      </div>

      {copiable ? (
        <button
          type="button"
          onClick={copierLeCode}
          aria-label="Copier le code"
          className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-2xl shadow-md"
          style={{ background: "linear-gradient(135deg, #7C3AED 0%, #C026D3 100%)" }}
        >
          {copie ? (
            <span className="text-[10px] font-semibold text-white">Copié !</span>
          ) : (
            <Image src="/images/copier-lien.png" alt="" width={28} height={28} />
          )}
        </button>
      ) : (
        <div className="flex h-[64px] w-[64px] shrink-0 items-center justify-center rounded-2xl border border-brand-line bg-white p-1.5 shadow-md">
          <QRCodeSVG value={code} size={52} />
        </div>
      )}
    </div>
  );
}

function BlocInfo({ titre, texte }: { titre: string; texte: string }) {
  return (
    <div className="mt-8">
      <p className="text-center text-sm font-bold text-[#12131a]">{titre}</p>
      <div className="mt-3 rounded-2xl bg-[#F4F5FA] p-5 text-sm leading-relaxed text-[#12131a]">{texte}</div>
    </div>
  );
}

export function DetailPrivilege({ id }: { id: string }) {
  const { token, pret } = useAuth();
  const [privilege, setPrivilege] = useState<Privilege | null | undefined>(undefined);
  const [codeParrainage, setCodeParrainage] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;

    apiFetch<Privilege[]>("/privileges", { token })
      .then((liste) => setPrivilege(liste.find((p) => String(p.id) === id) ?? null))
      .catch(() => setPrivilege(null));

    apiFetch<ProfilAvecParrainage>("/moi/profil", { token })
      .then((profil) => setCodeParrainage(profil.code_parrainage ?? null))
      .catch(() => setCodeParrainage(null));
  }, [id, token]);

  if (!pret || (token && privilege === undefined)) {
    return <p className="px-4 py-6 text-sm text-white/70">Chargement…</p>;
  }

  if (!token || !privilege) {
    return (
      <main className="min-h-full px-5 pt-6">
        <Link href="/privilege" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <p className="pt-6 text-sm text-white/70">Cet avantage est introuvable.</p>
      </main>
    );
  }

  const code = privilege.type_privilege === "parrainage" ? codeParrainage : privilege.code_promo;
  const Icon = iconePrivilege(privilege);

  return (
    <main
      className="min-h-full pb-10"
      style={{ background: "linear-gradient(160deg, #0A0035 0%, #3B0B6E 45%, #7A0C7E 100%)" }}
    >
      <div className="px-5 pt-6">
        <Link href="/privilege" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
      </div>

      <div className="px-5 pt-4">
        <div
          className="relative overflow-hidden rounded-[28px] p-5 text-white shadow-lg"
          style={{ background: degradePrivilege(privilege) }}
        >
          <Icon className="pointer-events-none absolute right-4 top-4 h-16 w-16 text-white/25" />
          <p className="text-sm font-semibold">{privilege.titre}</p>
          <span className="mt-2 inline-block rounded-full bg-white/20 px-3 py-1 text-[11px]">
            {tagPrivilege(privilege)}
          </span>
          <p className="mt-3 text-3xl font-extrabold">{valeurAffichee(privilege)}</p>
          {privilege.description ? (
            <p className="mt-2 max-w-[80%] text-xs text-white/90">{privilege.description}</p>
          ) : null}
        </div>
      </div>

      {code ? <BoiteCode code={code} copiable={privilege.type_privilege === "parrainage"} /> : null}

      <div className="mt-6 rounded-t-[2.5rem] bg-white px-5 pb-10 pt-6">
        <BlocInfo titre="Comment ça marche" texte={commentCaMarche(privilege)} />
        <BlocInfo titre="Condition" texte={conditionPrivilege(privilege)} />
      </div>
    </main>
  );
}
