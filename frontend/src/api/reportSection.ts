import type { errorResponse } from "../types/error";
import type {
  ReportSectionFormData,
  ReportSectionTableData,
} from "../types/reportSection";

interface ReportSectionResponse {
  reportSection: ReportSectionTableData;
}

interface ReportSectionsResponse {
  reportSection: ReportSectionTableData[];
}

export async function getAllReportSections(): Promise<ReportSectionsResponse> {
  const resp = await fetch("/api/report-section", {
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

export async function addReportSection(
  reportSectionData: ReportSectionFormData,
) {
  const resp = await fetch("/api/report-section", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: reportSectionData.name,
      reportId: reportSectionData.reportId,
      orderIndex: Number(reportSectionData.orderIndex),
    }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }
}

export async function getReportSectionById(
  id: string,
): Promise<ReportSectionResponse> {
  const resp = await fetch(`/api/report-section/${id}`, {
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

export async function updateReportSection(
  id: string,
  formData: ReportSectionFormData,
) {
  const resp = await fetch(`/api/report-section/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name: formData.name,
      reportId: formData.reportId,
      orderIndex: Number(formData.orderIndex),
    }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }

  return resp.json();
}

export async function deleteReportSectionById(id: string) {
  const resp = await fetch(`/api/report-section/${id}`, {
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
