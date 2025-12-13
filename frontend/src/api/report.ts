import type { errorResponse } from "../types/error";
import type { ReportTableData } from "../types/report";

interface ReportResponse {
  report: ReportTableData;
}

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
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
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
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }
}

export async function getReportById(id: string): Promise<ReportResponse> {
  const resp = await fetch(`/api/report/${id}`, {
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

export async function updateReport(id: string, name: string) {
  const resp = await fetch(`/api/report/${id}`, {
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

  return resp.json();
}

export async function deleteReportById(id: string) {
  const resp = await fetch(`/api/report/${id}`, {
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
