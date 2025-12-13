import type { CurrencyFormData, CurrencyTableData } from "../types/currency";
import type { errorResponse } from "../types/error";

interface CurrencyResponse {
  currency: CurrencyFormData;
}

export async function addCurrency(
  code: string,
  name: string,
  decimals: number,
): Promise<CurrencyFormData> {
  const resp = await fetch("/api/currency", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: code,
      name: name,
      decimals: Number(decimals),
    }),
  });

  if (!resp.ok) {
    const errorData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${resp.status}`);
  }

  return resp.json();
}

export async function getAllCurrencies(): Promise<CurrencyTableData[]> {
  const resp = await fetch("/api/currency", {
    headers: {
      "Content-Type": "applicaiton/json",
    },
  });

  if (!resp.ok) {
    throw new Error("Network response not ok.");
  }

  return resp.json();
}

export async function getCurrencyById(id: string): Promise<CurrencyResponse> {
  const resp = await fetch(`/api/currency/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${resp.status}`);
  }

  return resp.json();
}

export async function updateCurrencyById(
  id: string,
  code: string,
  name: string,
  decimals: number,
) {
  const resp = await fetch(`/api/currency/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      code: code,
      name: name,
      decimals: Number(decimals),
    }),
  });

  if (!resp.ok) {
    const errorData = await resp.json().catch(() => ({}));
    throw new Error(errorData.error || `API error: ${resp.status}`);
  }
}

export async function deleteCurrencyById(id: string) {
  const resp = await fetch(`/api/currency/${id}`, {
    method: "DELETE",
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }
}
