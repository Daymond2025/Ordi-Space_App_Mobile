import { AcademyDetail } from "./AcademyDetail";

export default async function AcademyDetailPage(props: PageProps<"/academy/[id]">) {
  const { id } = await props.params;

  return <AcademyDetail id={id} />;
}
