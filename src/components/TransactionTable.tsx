import { useEffect, useState } from "react";
import Papa, { ParseResult } from "papaparse";
import { Card } from "./ui/card";

const OperationEnum = {
  Buy: "Buy",
  Sell: "Sell",
  Dividend: "Dividend",
} as const;

type OperationEnum = (typeof OperationEnum)[keyof typeof OperationEnum];

const CurrencyEnum = {
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
} as const;
type CurrencyEnum = (typeof CurrencyEnum)[keyof typeof CurrencyEnum];

interface DataRow {
  operation: OperationEnum;
  ticker: string;
  date: string;
  type: string;
  quantity: number;
  price: number;
  currency: CurrencyEnum;
  note: string;
}

export default function TransactionTable({ onEdit }) {
  const [data, setData] = useState<DataRow[]>([]);

  useEffect(() => {
    fetch("/public/trade_journal.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse<DataRow>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: ParseResult<DataRow>) => {
            setData(results.data);
          },
          error: (error) => {
            console.error("Error parsing csv:", error);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching csv:", error);
      });
  }, []);

  return (
    <Card>
      <table className="min-w-full overflow-hidden">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="px-4 py-2">Operation</th>
            <th className="px-4 py-2">Ticker</th>
            <th className="px-4 py-2">Date</th>
            <th className="px-4 py-2">Type</th>
            <th className="px-4 py-2">Quantity</th>
            <th className="px-4 py-2">Price</th>
            <th className="px-4 py-2">Total Spent</th>
            <th className="px-4 py-2">Currency</th>
            <th className="px-4 py-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="px-4 py-2">{row.operation}</td>
              <td className="px-4 py-2">{row.ticker}</td>
              <td className="px-4 py-2">{row.date}</td>
              <td className="px-4 py-2">{row.type}</td>
              <td className="px-4 py-2">{row.quantity}</td>
              <td className="px-4 py-2">{row.price}</td>
              <td className="px-4 py-2">
                {(row.quantity * row.price).toFixed(2)}
              </td>
              <td className="px-4 py-2">{row.currency}</td>
              <td className="px-4 py-2">{row.note}</td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center py-4 text-gray-500">
                No transactions available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
