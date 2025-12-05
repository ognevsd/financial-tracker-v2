import type {
  TransactionFormData,
  TransactionTableData,
} from "../types/transaction";

interface TransactionResponse {
  transaction: TransactionTableData;
}

interface TransactionsResponse {
  transaction: TransactionTableData[];
}

interface errorResponse {
  error: string;
}

export async function getAllTransactions(): Promise<TransactionsResponse> {
  const resp = await fetch("/api/transaction", {
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

export async function addTransaction(
  transaction: TransactionFormData,
): Promise<TransactionResponse> {
  const resp = await fetch("/api/transaction", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      operation: transaction.operation,
      date: transaction.date,
      ticker: transaction.ticker,
      type: transaction.type,
      quantity: Number(transaction.quantity),
      price: Number(transaction.price),
      currency: transaction.currency,
      note: transaction.note,
    }),
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    throw new Error(errData.error || `API error: ${resp.status}`);
  }

  return resp.json();
}

export async function getTransactionById(
  id: string,
): Promise<TransactionResponse> {
  const resp = await fetch(`/api/transaction/${id}`, {
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!resp.ok) {
    const errData: errorResponse = await resp.json().catch(() => ({}));
    console.log(errData);
    throw new Error(errData.error || `API error: ${resp.status}`);
  }

  return resp.json();
}
