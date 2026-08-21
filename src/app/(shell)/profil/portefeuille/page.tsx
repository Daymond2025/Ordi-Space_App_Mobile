"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiFetch } from "@/lib/api";
import { formaterDate, formaterPrix, type Portefeuille, type TransactionPortefeuille } from "@/lib/types";
import { ChevronLeftIcon, WalletIcon } from "@/components/icons";

function LigneTransaction({ transaction }: { transaction: TransactionPortefeuille }) {
  const estCredit = transaction.type === "credit";

  return (
    <div className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-brand-ink">{transaction.motif}</p>
        <p className="mt-0.5 text-xs text-brand-muted">{formaterDate(transaction.date_transaction)}</p>
      </div>
      <span className={`shrink-0 text-sm font-bold ${estCredit ? "text-emerald-600" : "text-rose-500"}`}>
        {estCredit ? "+" : "-"}
        {formaterPrix(transaction.montant)} FCFA
      </span>
    </div>
  );
}

export default function PortefeuillePage() {
  const { token, pret } = useAuth();
  const [portefeuille, setPortefeuille] = useState<Portefeuille | null>(null);
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!token) return;
    apiFetch<Portefeuille>("/moi/portefeuille", { token }).then(setPortefeuille);
  }, [token]);

  async function copierLeCode() {
    if (!portefeuille) return;
    try {
      await navigator.clipboard.writeText(portefeuille.code_parrainage);
      setCopie(true);
      setTimeout(() => setCopie(false), 2000);
    } catch {
      // Clipboard indisponible — le code reste visible à l'écran.
    }
  }

  return (
    <main className="min-h-full pb-10">
      <div className="flex items-center gap-3 px-4 pt-4">
        <Link href="/profil" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-base font-bold text-brand-ink">Mon portefeuille</h1>
      </div>

      {!pret || (token && portefeuille === null) ? (
        <p className="px-4 pt-6 text-center text-sm text-brand-muted">Chargement…</p>
      ) : !token || !portefeuille ? (
        <p className="px-4 pt-6 text-center text-sm text-brand-muted">Connectez-vous pour voir votre portefeuille.</p>
      ) : (
        <>
          <div className="mt-4 px-4">
            <div className="bg-gradient-brand-blue relative overflow-hidden rounded-3xl p-5 text-white shadow-md">
              <WalletIcon className="pointer-events-none absolute right-4 top-4 h-16 w-16 text-white/25" />
              <p className="text-sm font-semibold text-white/90">Solde disponible</p>
              <p className="mt-2 text-4xl font-extrabold">{formaterPrix(portefeuille.solde)} FCFA</p>
            </div>
          </div>

          <div className="mt-4 px-4">
            <div className="flex items-center justify-between gap-3 rounded-2xl bg-white p-4 shadow-sm">
              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-muted">
                  Mon code de parrainage
                </p>
                <p className="mt-1 text-base font-bold text-brand-ink">{portefeuille.code_parrainage}</p>
              </div>
              <button
                type="button"
                onClick={copierLeCode}
                className="shrink-0 rounded-full bg-gradient-brand-blue px-4 py-2 text-xs font-semibold text-white"
              >
                {copie ? "Copié !" : "Copier"}
              </button>
            </div>
          </div>

          <div className="mt-6 px-4">
            <p className="text-sm font-bold text-brand-ink">Historique</p>

            <div className="mt-3 flex flex-col gap-3">
              {portefeuille.transactions.data.length === 0 ? (
                <p className="py-6 text-center text-sm text-brand-muted">Aucune transaction pour l&apos;instant.</p>
              ) : (
                portefeuille.transactions.data.map((transaction) => (
                  <LigneTransaction key={transaction.id} transaction={transaction} />
                ))
              )}
            </div>
          </div>
        </>
      )}
    </main>
  );
}
