"use client";

import { useRef, useState } from "react";
import { PlusIcon, UserIcon } from "@/components/icons";

/**
 * Photo de profil optionnelle à l'inscription — même champ que celui déjà
 * obligatoire côté Livreur (RegisterRequest::photo), ici facultatif comme
 * pour Fournisseur. Aperçu en data: URL (FileReader), pas un object URL
 * "blob:" — convention commune à toutes les apps (certaines ont une CSP qui
 * n'autorise que 'self'/data: en img-src, voir ChampDocument.tsx du Livreur).
 */
export function ChampPhotoProfil({ onChange }: { onChange: (fichier: File) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [apercu, setApercu] = useState<string | null>(null);

  function choisir(fichier: File | undefined) {
    if (!fichier) return;
    onChange(fichier);
    const lecteur = new FileReader();
    lecteur.onload = () => setApercu(typeof lecteur.result === "string" ? lecteur.result : null);
    lecteur.readAsDataURL(fichier);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-[#F1F2F6] text-brand-muted"
        aria-label="Ajouter une photo de profil"
      >
        {apercu ? (
          // eslint-disable-next-line @next/next/no-img-element -- aperçu local (blob:), non pris en charge par next/image
          <img src={apercu} alt="" className="h-full w-full object-cover" />
        ) : (
          <UserIcon className="h-8 w-8" />
        )}
        <span className="bg-gradient-brand-blue absolute bottom-0 right-0 flex h-6 w-6 items-center justify-center rounded-full text-white ring-2 ring-white">
          <PlusIcon className="h-3 w-3" />
        </span>
      </button>
      <p className="text-xs text-brand-muted">Photo de profil (optionnel)</p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => choisir(e.target.files?.[0])}
      />
    </div>
  );
}
