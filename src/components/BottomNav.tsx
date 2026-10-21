"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { useServiceSheet } from "@/context/ServiceSheetContext";
import type { Privilege } from "@/lib/types";
import { GiftIcon, GridIcon, PlayIcon, ShieldCheckIcon, UserIcon } from "./icons";
import type { ComponentType, SVGProps } from "react";

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: number;
};

const CLE_PRIVILEGES_VUS = "ordispace.privileges.vus";

// Pages secondaires (listes, formulaires, fiches) où la nav globale laisse
// la place au contenu — préfixes testés avec startsWith, donc leurs
// sous-pages (détail, étapes de formulaire) héritent du même traitement.
const PREFIXES_SANS_BOTTOMBAR = [
  "/produit/",
  "/privilege",
  "/mes-achats",
  "/mes-commandes",
  "/profil/portefeuille",
  "/reclamations",
  "/profil/aide",
  "/profil/compte",
  "/profil/conditions",
  "/service/assistances",
  "/service/declarer-panne",
  "/service/apres-vente",
  "/service/garantix",
  "/academy",
];

/**
 * Badge "nouveaux privilèges" — purement local (pas de notion de lu/non-lu
 * côté backend) : on compare le nombre total de privilèges actifs au nombre
 * déjà vu par ce client sur cet appareil, mémorisé dans localStorage.
 */
function useNombreNouveauxPrivileges(): number {
  const { token } = useAuth();
  const pathname = usePathname();
  const [nombre, setNombre] = useState(0);

  useEffect(() => {
    if (!token) return;

    apiFetch<Privilege[]>("/privileges", { token }).then((liste) => {
      const total = liste.length;
      const vus = Number(localStorage.getItem(CLE_PRIVILEGES_VUS) ?? "0");

      if (pathname.startsWith("/privilege")) {
        localStorage.setItem(CLE_PRIVILEGES_VUS, String(total));
        setNombre(0);
      } else {
        setNombre(Math.max(0, total - vus));
      }
    });
  }, [token, pathname]);

  return nombre;
}

const NAV_ITEM_PROFIL: NavItem = { href: "/profil", label: "Profil", icon: UserIcon };
const NAV_ITEM_SERVICE: NavItem = { href: "/service", label: "Service", icon: GridIcon };

const COULEUR_ACTIVE = "text-[color:var(--brand-blue-end)]";

function ContenuNavItem({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const Icon = item.icon;

  return (
    <>
      <span className={`relative flex h-9 w-9 items-center justify-center transition-colors ${isActive ? COULEUR_ACTIVE : "text-brand-muted"}`}>
        <Icon className="h-5 w-5" />
        {item.badge ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-semibold text-white">
            {item.badge}
          </span>
        ) : null}
      </span>
      <span className={isActive ? `font-semibold ${COULEUR_ACTIVE}` : undefined}>{item.label}</span>
      <span
        aria-hidden
        className={`mt-0.5 h-[3px] w-5 rounded-full transition-colors ${isActive ? "bg-[color:var(--brand-blue-end)]" : "bg-transparent"}`}
      />
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
  const nouveauxPrivileges = useNombreNouveauxPrivileges();

  if (PREFIXES_SANS_BOTTOMBAR.some((prefixe) => pathname.startsWith(prefixe))) return null;

  const navItems: NavItem[] = [
    { href: "/", label: "Space", icon: ShieldCheckIcon },
    { href: "/privilege", label: "Mes Privilège", icon: GiftIcon, badge: nouveauxPrivileges || undefined },
  ];

  return (
    <nav className="sticky bottom-0 z-20 border-t border-brand-line bg-white/95 backdrop-blur supports-backdrop-blur:bg-white/80">
      <ul className="mx-auto flex max-w-xl items-center justify-between px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2">
        {navItems.map((item) => (
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
            <span className="bg-gradient-brand-blue -mt-5 flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg shadow-blue-300 ring-4 ring-white">
              <PlayIcon className="h-5 w-5" />
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
