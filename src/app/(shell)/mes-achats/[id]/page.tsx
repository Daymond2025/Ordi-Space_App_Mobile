import { DetailAchat } from "./DetailAchat";

export default async function DetailAchatPage(props: PageProps<"/mes-achats/[id]">) {
  const { id } = await props.params;

  return <DetailAchat id={id} />;
}
