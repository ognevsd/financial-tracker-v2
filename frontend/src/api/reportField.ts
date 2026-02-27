import type { errorResponse } from "../types/error";
import type { Years } from "../types/field";

export async function upsertYear(
  year: number,
  prevYearValue: number | null,
  reportId: string,
  companyId: string,
) {
  const resp = await fetch("/api/report-field/year", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      year: year,
      reportId: reportId,
      companyId: companyId,
      prevYear: prevYearValue,
    }),
  });
  console.log(resp.status);

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => {});
    throw new Error(errData.error);
  }
}

export async function getYears(
  companyId: string,
  reportId: string,
): Promise<Years> {
  const url = `/api/report-field/year?companyId=${companyId}&reportId=${reportId}`;
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error);
  }
  return resp.json();
}

export async function deleteYear(
  companyId: string,
  reportId: string,
  year: number,
) {
  const params = new URLSearchParams({
    companyId: companyId,
    reportId: reportId,
    year: String(year),
  });
  const url = `/api/report-field/year?${params.toString()}`;
  const resp = await fetch(url, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  });
  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error);
  }
}
