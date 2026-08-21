import { SuiviCommande } from "./SuiviCommande";

export default async function SuiviCommandePage(props: PageProps<"/mes-commandes/[id]">) {
  const { id } = await props.params;

  return <SuiviCommande id={id} />;
}
