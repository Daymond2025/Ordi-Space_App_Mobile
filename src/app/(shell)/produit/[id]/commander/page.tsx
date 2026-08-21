import { Suspense } from "react";
import { CheckoutForm } from "./CheckoutForm";

export default async function CommanderPage(props: PageProps<"/produit/[id]/commander">) {
  const { id } = await props.params;

  return (
    <Suspense>
      <CheckoutForm id={id} />
    </Suspense>
  );
}
