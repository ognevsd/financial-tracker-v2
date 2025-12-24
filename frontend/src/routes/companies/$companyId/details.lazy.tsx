import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { getAssetById } from "../../../api/asset";
import AssetForm from "../../../components/AssetForm";
import Loading from "../../../components/Loading";

export const Route = createLazyFileRoute("/companies/$companyId/details")({
  component: RouteComponent,
});

function RouteComponent() {
  const { companyId } = Route.useParams();
  console.log(companyId);

  const { data, isLoading } = useQuery({
    queryFn: () => getAssetById(companyId),
    queryKey: ["asset", companyId],
    staleTime: 120_000,
  });

  if (isLoading) {
    <Loading />;
  }
  console.log(data);
  return <div>Hello "/companies/$companyId/details"!</div>;
  // return <AssetForm />;
}
