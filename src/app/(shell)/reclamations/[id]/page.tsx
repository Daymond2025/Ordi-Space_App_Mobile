import { DetailReclamation } from "./DetailReclamation";

export default async function DetailReclamationPage(props: PageProps<"/reclamations/[id]">) {
  const { id } = await props.params;

  return <DetailReclamation id={id} />;
}
