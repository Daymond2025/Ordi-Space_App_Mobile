import { DetailPointMaintenance } from "./DetailPointMaintenance";

export default async function DetailPointMaintenancePage(props: PageProps<"/service/maintenance/[id]">) {
  const { id } = await props.params;

  return <DetailPointMaintenance id={id} />;
}
