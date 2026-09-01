import { useEffect, type Dispatch, type SetStateAction } from "react";
import type { AssetFormData } from "../types/asset";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Button from "./ui/button";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getAllAssetTypes } from "../api/assetType";
import Loading from "./Loading";
import { getAllCurrencies } from "../api/currency";
import { Select, SelectOption } from "./ui/select";

interface AssetFormProps {
  formData: AssetFormData;
  setFormData: Dispatch<SetStateAction<AssetFormData>>;
  onSubmit: () => void;
  onClear: () => void;
  isEdit: boolean;
}

export default function AssetForm({
  formData,
  setFormData,
  onSubmit,
  onClear,
  isEdit,
}: AssetFormProps) {
  const { data: assetTypeData, isLoading: isAssetTypeLoading } = useQuery({
    queryFn: getAllAssetTypes,
    queryKey: ["all-asset-types"],
    staleTime: 120_000,
  });
  const { data: currencyData, isLoading: isCurrencyLoading } = useQuery({
    queryFn: getAllCurrencies,
    queryKey: ["all-currencies"],
    staleTime: 120_000,
  });

  useEffect(() => {
    if (
      formData.assetTypeId === "" &&
      !isAssetTypeLoading &&
      assetTypeData?.assetType !== null
    ) {
      setFormData((prev) => ({
        ...prev,
        assetTypeId: assetTypeData?.assetType[0].id || "",
      }));
    }
    if (
      formData.currencyId === "" &&
      !isCurrencyLoading &&
      currencyData !== null
    ) {
      setFormData((prev) => ({
        ...prev,
        currencyId: currencyData?.[0].id || "",
      }));
    }
  }, [isCurrencyLoading, isAssetTypeLoading]);

  if (isAssetTypeLoading || isCurrencyLoading) {
    return <Loading />;
  }

  return (
    <form
      className="space-y-2"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <div>
          <Label htmlFor="ticker">Ticker</Label>
          <Input
            type="text"
            id="ticker"
            name="ticker"
            required
            placeholder="e.g. AAPL"
            value={formData.ticker}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, ticker: e.target.value }));
            }}
          />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            required
            placeholder="e.g. Apple"
            value={formData.name}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, name: e.target.value }));
            }}
          />
        </div>
        <div>
          <Label>Asset Type</Label>
          <Select
            id="asset-type"
            name="asset-type"
            required
            value={formData.assetTypeId}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, assetTypeId: e.target.value }));
            }}
          >
            {assetTypeData?.assetType.map((item) => (
              <SelectOption value={item.id} key={item.id}>
                {item.name}
              </SelectOption>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="industry">Industry</Label>
          <Input
            id="industry"
            name="industry"
            type="text"
            placeholder="e.g. Tobacco, Oil"
            value={formData.industry}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, industry: e.target.value }));
            }}
          />
        </div>
        <div>
          <Label htmlFor="industry">Commodity</Label>
          <Input
            id="commodity"
            name="commodity"
            type="text"
            placeholder="e.g. Oil, Coal"
            value={formData.commodity}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, commodity: e.target.value }));
            }}
          />
        </div>
        <div>
          <Label>Currency</Label>
          <Select
            id="currency"
            name="currency"
            required
            value={formData.currencyId}
            onChange={(e) => {
              setFormData((prev) => ({ ...prev, currencyId: e.target.value }));
            }}
          >
            {currencyData?.map((item) => (
              <SelectOption value={item.id} key={item.id}>
                {item.code}
              </SelectOption>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="industry">Reporting Multiplicator</Label>
          <Input
            id="reporting-multiplicator"
            name="reporting-multiplicator"
            type="number"
            placeholder="e.g. 1000, 1000000"
            value={formData.reportingMultiplicator}
            onChange={(e) => {
              setFormData((prev) => ({
                ...prev,
                reportingMultiplicator:
                  e.target.value === "" ? "" : Number(e.target.value),
              }));
            }}
          />
        </div>
      </div>
      <div className="space-x-2">
        <Button type="submit">{isEdit ? "Save Changes" : "Add Asset"}</Button>
        <Button type="button" onClick={onClear} variant="secondary">
          Clear
        </Button>
      </div>
    </form>
  );
}
