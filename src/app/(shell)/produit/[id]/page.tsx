import { ProduitDetail } from "./ProduitDetail";

export default async function ProduitPage(props: PageProps<"/produit/[id]">) {
  const { id } = await props.params;

  return <ProduitDetail id={id} />;
}
