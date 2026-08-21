"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { ChevronLeftIcon } from "@/components/icons";
import { formaterDate, formaterPrix, type Pagination, type Privilege, type UtilisationPrivilege } from "@/lib/types";
import { degradePrivilege, iconePrivilege, tagPrivilege, valeurAffichee } from "./data";

function CartePrivilegeItem({ privilege }: { privilege: Privilege }) {
  const Icon = iconePrivilege(privilege);

  return (
    <Link
      href={`/privilege/${privilege.id}`}
      className="relative block h-[182px] w-[360px] overflow-hidden rounded-[28px] p-5 text-white shadow-md"
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
    </Link>
  );
}

function CarteUtilisation({ utilisation }: { utilisation: UtilisationPrivilege }) {
  return (
    <div className="flex w-[360px] items-center justify-between rounded-2xl bg-white/10 px-5 py-4 text-white">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold">{utilisation.privilege.titre}</p>
        <p className="mt-1 text-xs text-white/60">{formaterDate(utilisation.date_utilisation)}</p>
      </div>
      {parseFloat(utilisation.montant_remise) > 0 ? (
        <span className="shrink-0 text-sm font-bold">-{formaterPrix(utilisation.montant_remise)} FCFA</span>
      ) : null}
    </div>
  );
}

export function PrivilegeTabs() {
  const { token, pret } = useAuth();
  const [onglet, setOnglet] = useState<"exclusifs" | "utilises">("exclusifs");
  const [privileges, setPrivileges] = useState<Privilege[] | null>(null);
  const [utilisations, setUtilisations] = useState<UtilisationPrivilege[] | null>(null);

  useEffect(() => {
    if (!token) return;
    apiFetch<Privilege[]>("/privileges", { token }).then(setPrivileges);
    apiFetch<Pagination<UtilisationPrivilege>>("/moi/privileges-utilises", { token }).then((page) =>
      setUtilisations(page.data)
    );
  }, [token]);

  return (
    <>
      <section className="bg-gradient-brand-blue rounded-b-[2.5rem] px-5 pb-6 pt-6 text-white">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold">Privilège Space</h1>
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <Image src="/images/icon-privilege.png" alt="" width={24} height={32} />
          </span>
        </div>

        <div className="mt-5 flex h-9 rounded-full bg-white/10 p-1">
          <button
            type="button"
            onClick={() => setOnglet("exclusifs")}
            className={`flex-1 rounded-full text-xs font-semibold transition-colors ${
              onglet === "exclusifs" ? "bg-gradient-brand-blue text-white" : "text-white/70"
            }`}
          >
            Avantages exclusifs
          </button>
          <button
            type="button"
            onClick={() => setOnglet("utilises")}
            className={`flex-1 rounded-full text-xs font-semibold transition-colors ${
              onglet === "utilises" ? "bg-gradient-brand-blue text-white" : "text-white/70"
            }`}
          >
            Avantages déjà utilisés
          </button>
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 px-4 pt-5">
        {!pret || (token && (onglet === "exclusifs" ? privileges === null : utilisations === null)) ? (
          <p className="py-10 text-center text-sm text-white/60">Chargement…</p>
        ) : onglet === "exclusifs" ? (
          privileges && privileges.length > 0 ? (
            privileges.map((privilege) => <CartePrivilegeItem key={privilege.id} privilege={privilege} />)
          ) : (
            <p className="py-10 text-center text-sm text-white/60">Aucun avantage disponible pour l&apos;instant.</p>
          )
        ) : utilisations && utilisations.length > 0 ? (
          utilisations.map((utilisation) => <CarteUtilisation key={utilisation.id} utilisation={utilisation} />)
        ) : (
          <p className="py-10 text-center text-sm text-white/60">Aucun avantage utilisé pour l&apos;instant.</p>
        )}
      </section>
    </>
  );
}
