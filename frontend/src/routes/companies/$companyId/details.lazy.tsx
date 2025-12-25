import { useQuery } from "@tanstack/react-query";
import { createLazyFileRoute } from "@tanstack/react-router";
import { getAssetById } from "../../../api/asset";
import AssetForm from "../../../components/AssetForm";
import Loading from "../../../components/Loading";
import { useEffect, useState } from "react";
import type { AssetFormData } from "../../../types/asset";

export const Route = createLazyFileRoute("/companies/$companyId/details")({
  component: RouteComponent,
});

const defaultFormData: AssetFormData = {
  ticker: "",
  name: "",
  assetTypeId: "",
  industry: "",
  commodity: "",
  currencyId: "",
  reportingMultiplicator: "",
};

function RouteComponent() {
  const { companyId } = Route.useParams();
  const [formData, setFormData] = useState<AssetFormData>(defaultFormData);
  const [assetId, setAssetId] = useState<string | null>();

  const { data, isLoading } = useQuery({
    queryFn: () => getAssetById(companyId),
    queryKey: ["asset", companyId],
    staleTime: 120_000,
  });

  // useEffect(() => {
  //   if (data?.asset) {
  //     setFormData(data.asset);
  //   }
  // }, [data]);

  if (isLoading) {
    return <Loading />;
  }

  if (data && data?.asset.id !== assetId) {
    setAssetId(data?.asset.id);
    setFormData(data.asset);
  }

  return (
    <AssetForm
      formData={formData}
      setFormData={setFormData}
      onSubmit={() => {
        console.log("Edit");
      }}
      onClear={() => {
        console.log("clear");
      }}
      isEdit={true}
    />
  );
}
