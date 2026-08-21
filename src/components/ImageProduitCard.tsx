import Image from "next/image";
import { MonitorIcon } from "@/components/icons";
import type { ImageProduit } from "@/lib/types";

export function ImageProduitCard({
  images,
  nom,
  sizes,
}: {
  images: ImageProduit[];
  nom: string;
  sizes?: string;
}) {
  const image = images[0];

  if (!image) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#EEF1F6] text-brand-muted">
        <MonitorIcon className="h-8 w-8" />
      </div>
    );
  }

  return (
    <Image
      src={image.url_image}
      alt={nom}
      fill
      className="object-cover"
      sizes={sizes ?? "(max-width: 480px) 50vw, 200px"}
    />
  );
}
