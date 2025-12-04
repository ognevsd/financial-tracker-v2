import type { OperationTableData } from "../types/operations";

interface errorResponse {
  error: string;
}

interface operationsResponse {
  operation: OperationTableData[];
}

interface operationResponse {
  operation: OperationTableData;
}

export async function getAllOperations(): Promise<operationsResponse> {
  const resp = await fetch("/api/operation", {
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

export async function addOperation(name: string) {
  const resp = await fetch("/api/operation", {
    method: "POST",
    headers: {
      "Content-Type": "applicaion/json",
    },
    body: JSON.stringify({ name: name }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }
}

export async function getOperationById(id: string): Promise<operationResponse> {
  const resp = await fetch(`/api/operation/${id}`, {
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
export async function updateOperationById(id: string, name: string) {
  const resp = await fetch(`/api/operation/${id}`, {
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
}
export async function DeleteOperationById(id: string) {
  const resp = await fetch(`/api/operation/${id}`, {
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
