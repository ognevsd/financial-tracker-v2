import type { errorResponse } from "../types/error";

export async function upsertFieldValue({
  fieldId,
  year,
  value,
}: {
  fieldId: string;
  year: number;
  value: number;
}) {
  console.log(
    JSON.stringify({
      fieldId: fieldId,
      year: year,
      value: value,
    }),
  );
  const resp = await fetch("/api/field-value", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fieldId: fieldId,
      year: year,
      // value: value === "" ? null : Number(value), // TODO: Need to support empty values in FE
      value: Number(value),
    }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error);
  }
}
