export interface TransactionFormData {
  operation: string;
  date: string;
  ticker: string;
  type: string;
  quantity: number;
  price: number;
  currency: string;
  note: string;
}

export interface TransactionTableData extends TransactionFormData {
  id: string;
}
