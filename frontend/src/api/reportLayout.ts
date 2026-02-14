import type { errorResponse } from "../types/error";

export interface UpsertData {
  companyId: string;
  sectionId: string;
  fieldId: string;
  orderIndex: number;
  name: string;
}

export async function upsertField({
  companyId,
  sectionId,
  fieldId,
  orderIndex,
  name,
}: UpsertData) {
  const resp = await fetch("/api/report-field ", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      companyId: companyId,
      sectionId: sectionId,
      fieldId: fieldId,
      orderIndex: orderIndex,
      name: name,
    }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error);
  }
}
