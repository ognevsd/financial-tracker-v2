import type { errorResponse } from "../types/error";
import type { TaxonomyFormData, TaxonomyTableData } from "../types/taxonomy";

interface TaxonomyResponse {
  taxonomy: TaxonomyTableData;
}

interface TaxonomiesResponse {
  taxonomy: TaxonomyTableData[];
}

export async function getAllTaxonomies(): Promise<TaxonomiesResponse> {
  const resp = await fetch("/api/taxonomy", {
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

export async function addTaxonomy(formData: TaxonomyFormData) {
  const resp = await fetch("/api/taxonomy", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.name,
      description: formData.description,
      reportId: formData.reportId,
    }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }
}

export async function getTaxonomyById(id: string): Promise<TaxonomyResponse> {
  const resp = await fetch(`/api/taxonomy/${id}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData || `API error: ${resp.status}`);
  }

  return resp.json();
}

export async function updateTaxonomy(id: string, formData: TaxonomyFormData) {
  const resp = await fetch(`/api/taxonomy/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.name,
      description: formData.description,
      reportId: formData.reportId,
    }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }

  return resp.json();
}

export async function deleteTaxonomyById(id: string) {
  const resp = await fetch(`/api/taxonomy/${id}`, {
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
