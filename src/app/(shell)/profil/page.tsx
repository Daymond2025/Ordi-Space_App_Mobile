"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import type { NotificationOrdispace, Pagination } from "@/lib/types";
import {
  BagIcon,
  BellIcon,
  ChevronRightIcon,
  HeadsetIcon,
  ReceiptIcon,
  ShieldCheckIcon,
  StorefrontIcon,
  TicketIcon,
  WalletIcon,
} from "@/components/icons";
import type { ComponentType, SVGProps } from "react";

function ItemMenu({
  icon: Icon,
  label,
  href,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
}) {
  return (
    <Link href={href} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3.5 shadow-sm">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1F2F6] text-brand-muted">
        <Icon className="h-4 w-4" />
      </span>
      <span className="flex-1 text-sm font-medium text-brand-ink">{label}</span>
      <ChevronRightIcon className="h-4 w-4 text-brand-muted" />
    </Link>
  );
}

export default function ProfilPage() {
  const { user, token } = useAuth();
  const nomComplet = user ? `${user.prenom ?? ""} ${user.nom}`.trim() : "Invité";
  const [nombreNonLues, setNombreNonLues] = useState(0);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pagination<NotificationOrdispace>>("/moi/notifications", { token }).then((page) => {
      setNombreNonLues(page.data.filter((n) => !n.lu).length);
    });
  }, [token]);

  return (
    <main className="min-h-full pb-8">
      <section className="bg-gradient-brand-blue rounded-b-[2.5rem] px-5 pb-14 pt-6 text-white">
        <div className="flex items-center justify-between">
          <span className="w-9" aria-hidden />
          <h1 className="text-lg font-bold">Ordi&apos;Space</h1>
          <Link
            href="/notifications"
            className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white"
          >
            <BellIcon className="h-5 w-5 text-amber-500" />
            {nombreNonLues > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[9px] font-semibold text-white">
                {nombreNonLues > 9 ? "9+" : nombreNonLues}
              </span>
            ) : null}
          </Link>
        </div>
      </section>

      <section className="relative -mt-10 px-4">
        <div className="flex items-center justify-between rounded-3xl bg-white p-5 shadow-lg shadow-blue-100">
          <div>
            <p className="text-sm text-brand-muted">
              Bonjour, <span aria-hidden>👋</span>
            </p>
            <p className="mt-1 text-xl font-bold text-brand-ink">{nomComplet}</p>
          </div>

          {/* Cliquable : informations personnelles, adresses, déconnexion. */}
          <Link href="/profil/compte" className="h-16 w-16 shrink-0 overflow-hidden rounded-full">
            <Image
              src="/images/image-standart-profil.jpg"
              alt="Voir mon compte"
              width={64}
              height={64}
              className="h-full w-full object-cover"
            />
          </Link>
        </div>
      </section>

      <section className="mt-6 flex flex-col gap-3 px-4">
        <ItemMenu icon={BagIcon} label="Mes achats" href="/mes-achats" />
        <ItemMenu icon={ReceiptIcon} label="Mes commandes" href="/mes-commandes" />
        <ItemMenu icon={WalletIcon} label="Mon portefeuille" href="/profil/portefeuille" />
        <ItemMenu icon={StorefrontIcon} label="Market'Space" href="/market-space" />
      </section>

      <section className="mt-8 px-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-muted">Info &amp; aide</p>
        <div className="mt-3 flex flex-col gap-3">
          <ItemMenu icon={TicketIcon} label="Mes réclamations" href="/reclamations" />
          <ItemMenu icon={ShieldCheckIcon} label="Conditions générales d'utilisation" href="/profil/conditions" />
          <ItemMenu icon={HeadsetIcon} label="Centre d'aide" href="/profil/aide" />
        </div>
      </section>
    </main>
  );
}
