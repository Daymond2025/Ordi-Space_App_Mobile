"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { ChevronLeftIcon } from "@/components/icons";

export function EnTetePanne() {
  const router = useRouter();

  return (
    <div className="bg-gradient-brand-blue relative overflow-hidden rounded-b-[2rem] px-5 pt-4" style={{ height: 340 }}>
      <Image
        src="/images/polycone.png"
        alt=""
        width={164}
        height={139}
        className="pointer-events-none absolute opacity-[0.34]"
        style={{ top: 11, left: 31, transform: "rotate(-27.05deg)" }}
      />

      <button
        type="button"
        onClick={() => router.back()}
        className="relative flex h-9 w-9 items-center justify-center rounded-full bg-white/90 text-brand-ink"
      >
        <ChevronLeftIcon className="h-5 w-5" />
      </button>

      <h1 className="relative mt-6 text-2xl font-extrabold leading-snug text-white">
        Déclarer
        <br />
        une panne
      </h1>

      {/* Positionnée en absolu à l'identique du mockup : la mascotte entière
          doit se lire près du sommet de l'en-tête. */}
      <div className="pointer-events-none absolute" style={{ width: 267, height: 267, top: 9, left: 126 }}>
        <Image src="/images/mascotte_panne.png" alt="" fill className="object-contain" priority />
      </div>
    </div>
  );
}
