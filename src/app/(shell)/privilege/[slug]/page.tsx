import { DetailPrivilege } from "./DetailPrivilege";

export default async function PrivilegeDetailPage(props: PageProps<"/privilege/[slug]">) {
  const { slug } = await props.params;

  return <DetailPrivilege id={slug} />;
}
