"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formaterDate, type Adresse } from "@/lib/types";
import { ChevronLeftIcon, ChevronRightIcon, DotsVerticalIcon, LogoutIcon, PhoneIcon, UserIcon } from "@/components/icons";

type ProfilDetail = {
  nom: string;
  prenom: string | null;
  telephone: string | null;
  created_at: string;
};

function moisDepuis(iso: string): number {
  const debut = new Date(iso);
  const maintenant = new Date();
  return Math.max(0, (maintenant.getFullYear() - debut.getFullYear()) * 12 + (maintenant.getMonth() - debut.getMonth()));
}

function ChampInfo({ label, valeur }: { label: string; valeur: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm">
      <span className="bg-gradient-brand-blue flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white">
        <PhoneIcon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-xs text-brand-muted">{label}</p>
        <p className="truncate text-sm font-bold text-brand-ink">{valeur}</p>
      </div>
    </div>
  );
}

export default function ComptePage() {
  const { token, logout } = useAuth();
  const router = useRouter();
  const [profil, setProfil] = useState<ProfilDetail | null>(null);
  const [adresse, setAdresse] = useState<Adresse | null>(null);
  const [menuOuvert, setMenuOuvert] = useState(false);
  const [deconnexionEnCours, setDeconnexionEnCours] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<ProfilDetail>("/moi/profil", { token }).then(setProfil);
    apiFetch<Adresse[]>("/moi/adresses", { token }).then((liste) => setAdresse(liste[0] ?? null));
  }, [token]);

  useEffect(() => {
    if (!menuOuvert) return;
    function surClicExterieur(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOuvert(false);
    }
    document.addEventListener("mousedown", surClicExterieur);
    return () => document.removeEventListener("mousedown", surClicExterieur);
  }, [menuOuvert]);

  async function onDeconnexion() {
    setDeconnexionEnCours(true);
    await logout();
    router.replace("/connexion");
  }

  const nomComplet = profil ? (profil.prenom ? `${profil.prenom} ${profil.nom}` : profil.nom) : "";

  return (
    <main className="min-h-full pb-8">
      <div className="bg-gradient-brand-blue relative overflow-hidden rounded-b-[2.5rem] px-4 pb-16 pt-4 text-white">
        <div className="flex items-center justify-between">
          <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-semibold">Mes info</h1>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOuvert((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20"
              aria-label="Options"
            >
              <DotsVerticalIcon className="h-5 w-5" />
            </button>
            {menuOuvert ? (
              <div className="absolute right-0 top-11 z-10 w-56 overflow-hidden rounded-2xl bg-white text-brand-ink shadow-xl">
                <Link href="/profil/compte/informations" className="flex items-center justify-between px-4 py-3 text-sm">
                  Modifier mes informations
                  <ChevronRightIcon className="h-4 w-4 text-brand-muted" />
                </Link>
                <Link href="/profil/compte/adresses" className="flex items-center justify-between border-t border-brand-line px-4 py-3 text-sm">
                  Mes adresses
                  <ChevronRightIcon className="h-4 w-4 text-brand-muted" />
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="relative -mt-12 mx-4 flex flex-col items-center rounded-3xl bg-white px-6 py-6 shadow-lg shadow-blue-100">
        <div className="relative">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#F1F2F6] text-brand-muted">
            <UserIcon className="h-9 w-9" />
          </span>
          <span className="absolute bottom-1 right-1 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
        </div>
        <p className="mt-3 text-lg font-bold text-brand-ink">{profil ? nomComplet : "…"}</p>
        {profil ? (
          <p className="mt-1 text-xs text-brand-muted">
            Membre depuis : {formaterDate(profil.created_at)} ({moisDepuis(profil.created_at)} Mois)
          </p>
        ) : null}
      </div>

      <div className="mt-5 flex flex-col gap-3 px-4">
        <ChampInfo label="Nom et prénom" valeur={profil ? nomComplet : "…"} />
        <ChampInfo label="Contact" valeur={profil?.telephone ?? "Non renseigné"} />
        <ChampInfo
          label="Localisation"
          valeur={adresse ? `${adresse.ville}, ${adresse.rue}` : "Aucune adresse enregistrée"}
        />
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={onDeconnexion}
          disabled={deconnexionEnCours}
          style={{ width: 313, height: 61, borderRadius: 34.5 }}
          className="flex items-center justify-center gap-2 bg-rose-500 text-base font-semibold text-white disabled:opacity-60"
        >
          <LogoutIcon className="h-5 w-5" />
          {deconnexionEnCours ? "Déconnexion…" : "Se déconnecter"}
        </button>
      </div>
    </main>
  );
}
