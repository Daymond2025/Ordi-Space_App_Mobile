"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formaterDateHeure, type NotificationOrdispace, type Pagination } from "@/lib/types";
import { BellIcon, ChevronLeftIcon } from "@/components/icons";

export default function NotificationsPage() {
  const { token, pret } = useAuth();
  const [notifications, setNotifications] = useState<NotificationOrdispace[] | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Pagination<NotificationOrdispace>>("/moi/notifications", { token }).then((page) => setNotifications(page.data));
  }, [token]);

  const nombreNonLues = notifications?.filter((n) => !n.lu).length ?? 0;

  async function marquerLue(notification: NotificationOrdispace) {
    if (!token || notification.lu) return;

    setNotifications((liste) => liste?.map((n) => (n.id === notification.id ? { ...n, lu: true } : n)) ?? liste);

    try {
      await apiFetch(`/moi/notifications/${notification.id}/lue`, { method: "PATCH", token });
    } catch {
      setNotifications((liste) => liste?.map((n) => (n.id === notification.id ? { ...n, lu: false } : n)) ?? liste);
    }
  }

  async function toutMarquerLu() {
    if (!token || !notifications) return;
    const nonLues = notifications.filter((n) => !n.lu);
    if (nonLues.length === 0) return;

    setNotifications((liste) => liste?.map((n) => ({ ...n, lu: true })) ?? liste);

    await Promise.all(
      nonLues.map((n) => apiFetch(`/moi/notifications/${n.id}/lue`, { method: "PATCH", token }).catch(() => null))
    );
  }

  return (
    <main className="min-h-full pb-6">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="flex-1 text-base font-bold text-brand-ink">Notifications</h1>
        {nombreNonLues > 0 ? (
          <button type="button" onClick={toutMarquerLu} className="text-xs font-semibold text-[color:var(--brand-blue-end)]">
            Tout marquer lu
          </button>
        ) : null}
      </div>

      <div className="mt-4 flex flex-col gap-3 px-4">
        {!pret || (token && notifications === null) ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Chargement…</p>
        ) : !token ? (
          <p className="pt-6 text-center text-sm text-brand-muted">Connectez-vous pour voir vos notifications.</p>
        ) : notifications?.length === 0 ? (
          <div className="flex flex-col items-center gap-3 pt-10 text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#F1F2F6] text-brand-muted">
              <BellIcon className="h-6 w-6" />
            </span>
            <p className="text-sm text-brand-muted">Vous n&apos;avez reçu aucune notification pour le moment.</p>
          </div>
        ) : (
          notifications?.map((notification) => (
            <button
              key={notification.id}
              type="button"
              onClick={() => marquerLue(notification)}
              className={`flex items-start gap-3 rounded-2xl p-4 text-left shadow-sm transition-colors ${
                notification.lu ? "bg-white" : "border-l-4 border-[color:var(--brand-blue-end)] bg-blue-50"
              }`}
            >
              <span
                className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  notification.lu ? "bg-[#F1F2F6] text-brand-muted" : "bg-gradient-brand-blue text-white"
                }`}
              >
                <BellIcon className="h-4.5 w-4.5" />
              </span>

              <div className="min-w-0 flex-1">
                <p className={`text-sm leading-relaxed text-brand-ink ${notification.lu ? "font-medium" : "font-bold"}`}>
                  {notification.contenu}
                </p>
                <p className="mt-1.5 text-[11px] text-brand-muted">{formaterDateHeure(notification.date_envoi)}</p>
              </div>

              {!notification.lu ? <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[color:var(--brand-blue-end)]" /> : null}
            </button>
          ))
        )}
      </div>
    </main>
  );
}
