import type { AssetTypeTableData } from "../types/assetType";

interface errorResponse {
  error: string;
}

interface assetTypesResponse {
  assetType: AssetTypeTableData[];
}

interface assetTypeResponse {
  assetType: AssetTypeTableData;
}

export async function getAllAssetTypes(): Promise<assetTypesResponse> {
  const resp = await fetch("/api/assettype", {
    method: "GET",
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

export async function addAssetType(name: string) {
  const resp = await fetch("/api/assettype", {
    method: "POST",
    headers: {
      "Content-Type": "applicaion/json",
    },
    body: JSON.stringify({ name: name }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }
}

export async function getAssetTypeById(id: string): Promise<assetTypeResponse> {
  const resp = await fetch(`/api/assettype/${id}`, {
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
export async function updateAssetTypeById(id: string, name: string) {
  const resp = await fetch(`/api/assettype/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }
}
export async function DeleteAssetTypeById(id: string) {
  const resp = await fetch(`/api/assettype/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }
}
