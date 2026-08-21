import { Suspense } from "react";
import { CheckoutPanierForm } from "./CheckoutPanierForm";

export default function CommanderPanierPage() {
  return (
    <Suspense>
      <CheckoutPanierForm />
    </Suspense>
  );
}
