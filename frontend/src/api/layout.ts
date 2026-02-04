import type { errorResponse } from "../types/error";
import type { Layout } from "../types/report";

export async function getLayout(
  reportId: string,
  companyId: string,
): Promise<Layout> {
  let url = "/api/report/layout";
  const urlParams = new URLSearchParams();
  urlParams.append("reportId", reportId);
  urlParams.append("companyId", companyId);
  url += `?${urlParams.toString()}`;
  const resp = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    const errText = errData.error || `API error: ${resp.status}`;
    console.error(errText);
    throw new Error(errText);
  }

  return resp.json();
}
