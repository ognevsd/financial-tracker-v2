import type { errorResponse } from "../types/error";

export interface UpsertData {
  companyId: string;
  reportId: string;
  sectionId: string;
  fieldId: string;
  orderIndex: number;
  name: string;
}

export interface SwapFieldsData {
  fieldIdOne: string;
  orderIndexOne: number;
  fieldIdTwo: string;
  orderIndexTwo: number;
}

export async function upsertField({
  companyId,
  reportId,
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
      reportId: reportId,
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

export async function deleteField(id: string) {
  const resp = await fetch(`/api/report-field/${id}`, {
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

export async function swapFields(data: SwapFieldsData) {
  const resp = await fetch("/api/report-field/swap", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fieldIdOne: data.fieldIdOne,
      orderIndexOne: data.orderIndexOne,
      fieldIdTwo: data.fieldIdTwo,
      orderIndexTwo: data.orderIndexTwo,
    }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error);
  }
}
