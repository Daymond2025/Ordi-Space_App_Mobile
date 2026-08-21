import { Suspense } from "react";
import { SelectionPointMaintenance } from "./SelectionPointMaintenance";

export default function RendezVousPage() {
  return (
    <Suspense>
      <SelectionPointMaintenance />
    </Suspense>
  );
}
