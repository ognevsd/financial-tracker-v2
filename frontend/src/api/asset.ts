import type { AssetFormData, AssetTableData } from "../types/asset";
import type { errorResponse } from "../types/error";

interface AssetResponse {
  asset: AssetTableData;
}
interface AssetsResponse {
  asset: AssetTableData[];
}
export async function getAllAssets(): Promise<AssetsResponse> {
  const resp = await fetch("/api/asset", {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }

  return resp.json();
}

export async function addAsset(asset: AssetFormData) {
  const resp = await fetch("/api/asset", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ticker: asset.ticker,
      name: asset.name,
      assetTypeId: asset.assetTypeId,
      industry: asset.industry,
      commodity: asset.commodity,
      currencyId: asset.currencyId,
      reportingMultiplicator: Number(asset.reportingMultiplicator),
    }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }
}

export async function getAssetById(id: string): Promise<AssetResponse> {
  const resp = await fetch(`/api/asset/${id}`, {
    headers: {
      "Content-Type": "appliction/json",
    },
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }

  return resp.json();
}
