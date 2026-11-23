"use client";

import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { ListeNotifications } from "@/components/notifications/Notifications";
import { useAuth } from "@/context/AuthContext";

export default function NotificationsPage() {
  const { token, pret } = useAuth();

  return (
    <main className="min-h-full pb-6">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 text-base font-bold text-brand-ink">Notifications</h1>
      </div>

      <div className="mt-4 px-4">
        {!pret ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Chargement…</p>
        ) : !token ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Connectez-vous pour voir vos notifications.</p>
        ) : (
          <ListeNotifications />
        )}
      </div>
    </main>
  );
}
