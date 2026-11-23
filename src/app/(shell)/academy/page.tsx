import Link from "next/link";
import { ChevronLeftIcon } from "@/components/icons";
import { AcademyTabs } from "./AcademyTabs";

export default function AcademyPage() {
  return (
    <main className="min-h-full pb-6">
      {/* Fond blanc derrière le header : ses coins arrondis sont posés sur le
          blanc des onglets, sans bande grise entre les deux. */}
      <div className="bg-white">
      <section className="bg-gradient-brand-blue relative z-0 rounded-b-[24px] px-5 pb-6 pt-6 text-white">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20">
            <ChevronLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-base font-bold">Académy Space</h1>
          <span className="h-9 w-9" aria-hidden />
        </div>
      </section>
      </div>

      <AcademyTabs />
    </main>
  );
}
