import { Suspense } from "react";
import { DescriptionPanne } from "./DescriptionPanne";

export default function DeclarerPanneDescriptionPage() {
  return (
    <Suspense>
      <DescriptionPanne />
    </Suspense>
  );
}
