import type { ReportTableData } from "../types/report";

interface ReportsResponse {
  report: ReportTableData[];
}

export async function getAllReports(): Promise<ReportsResponse> {
  const resp = await fetch("/api/report", {
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

export async function addReport(name: string) {
  const resp = await fetch("/api/report", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: name }),
  });

  if (!resp.ok) {
    const errData = await resp.json().catch(() => ({}));
    throw new Error(errData || `API error: ${resp.status}`);
  }
}
