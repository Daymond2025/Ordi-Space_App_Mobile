"use client";

import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";

export default function ConditionsMaintenancePage() {
  const router = useRouter();

  return (
    <main className="min-h-full pb-6">
      <div className="flex items-center gap-3 px-4 pt-4">
        <button type="button" onClick={() => router.back()} className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-line">
          <ChevronLeftIcon className="h-5 w-5" />
        </button>
        <h1 className="text-base font-bold text-brand-ink">Conditions de maintenance gratuite</h1>
      </div>
      <p className="px-4 pt-6 text-sm text-brand-muted">Écran à venir.</p>
    </main>
  );
}
