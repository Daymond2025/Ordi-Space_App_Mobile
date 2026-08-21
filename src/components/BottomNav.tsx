"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useServiceSheet } from "@/context/ServiceSheetContext";
import { GiftIcon, GridIcon, PlayIcon, ShieldCheckIcon, UserIcon } from "./icons";
import type { ComponentType, SVGProps } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: number;
};

const NAV_ITEMS: NavItem[] = [
  { href: "/", label: "Space", icon: ShieldCheckIcon },
  { href: "/privilege", label: "Mes Privilège", icon: GiftIcon, badge: 1 },
];

const NAV_ITEM_PROFIL: NavItem = { href: "/profil", label: "Profil", icon: UserIcon };
const NAV_ITEM_SERVICE: NavItem = { href: "/service", label: "Service", icon: GridIcon };

function ContenuNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;

  return (
    <>
      <span
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
          isActive ? "bg-gradient-brand-blue text-white shadow-md shadow-blue-200" : "text-brand-muted"
        }`}
      >
        <Icon className="h-5 w-5" />
        {item.badge ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-semibold text-white">
            {item.badge}
          </span>
        ) : null}
      </span>
      <span className={isActive ? "text-brand-ink" : undefined}>{item.label}</span>
    </>
  );
}

function NavLink({ item, isActive }: { item: NavItem; isActive: boolean }) {
  return (
    <Link
      href={item.href}
      className="flex flex-col items-center gap-1 py-1 text-[11px] font-medium text-brand-muted"
      aria-current={isActive ? "page" : undefined}
    >
      <ContenuNavItem item={item} isActive={isActive} />
    </Link>
  );
}

export function BottomNav() {
  const pathname = usePathname();
  const { ouvert, ouvrir } = useServiceSheet();
  const estActif = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));

  return (
    <nav className="sticky bottom-0 z-20 border-t border-brand-line bg-white/95 backdrop-blur supports-backdrop-blur:bg-white/80">
      <ul className="mx-auto flex max-w-xl items-center justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {NAV_ITEMS.map((item) => (
          <li key={item.href} className="flex-1">
            <NavLink item={item} isActive={estActif(item.href)} />
          </li>
        ))}

        {/* Bouton flottant central — accès rapide à Académy Space (tutos et
            formations), mis en avant au-dessus de la barre. */}
        <li className="flex-1">
          <Link
            href="/academy"
            className="flex flex-col items-center gap-1 text-[11px] font-medium text-brand-muted"
          >
            <span className="bg-gradient-brand-blue -mt-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-lg shadow-blue-300 ring-4 ring-white">
              <PlayIcon className="h-6 w-6" />
            </span>
          </Link>
        </li>

        {/* Service ouvre la feuille "À votre service" plutôt que de naviguer
            vers une page — elle doit rester accessible par-dessus l'écran
            courant, quel que soit l'onglet actif. */}
        <li className="flex-1">
          <button
            type="button"
            onClick={ouvrir}
            className="flex w-full flex-col items-center gap-1 py-1 text-[11px] font-medium text-brand-muted"
            aria-current={ouvert ? "page" : undefined}
          >
            <ContenuNavItem item={NAV_ITEM_SERVICE} isActive={ouvert} />
          </button>
        </li>

        <li className="flex-1">
          <NavLink item={NAV_ITEM_PROFIL} isActive={estActif(NAV_ITEM_PROFIL.href)} />
        </li>
      </ul>
    </nav>
  );
}
