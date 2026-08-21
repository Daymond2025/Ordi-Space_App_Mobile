import { Suspense } from "react";
import { FormulaireInscription } from "./FormulaireInscription";

export default function InscriptionPage() {
  return (
    <Suspense>
      <FormulaireInscription />
    </Suspense>
  );
}
