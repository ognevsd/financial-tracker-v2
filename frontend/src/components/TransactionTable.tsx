import { useQuery } from "@tanstack/react-query";
import { getAllTransactions } from "../api/transaction";
import { useMemo, useState } from "react";
import { Select, SelectOption } from "./ui/select";

interface TransactionTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

type OrderOption = "New First" | "Old First";

export default function TransactionTable({
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const [sortOrder, setSortOrder] = useState<OrderOption>("New First");
  const { isLoading, data } = useQuery({
    queryFn: getAllTransactions,
    queryKey: ["all-transactions"],
    staleTime: 120_000,
  });

  const sortedData = useMemo(() => {
    if (!data?.transaction) return [];
    return [...data.transaction].sort((a, b) => {
      if (sortOrder == "New First") {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
  }, [data, sortOrder]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.transaction === null) {
    return <div>No transactions in DB</div>;
  }

  return (
    <>
      <div>
        <Select
          value={sortOrder}
          onChange={(e) =>
            setSortOrder(
              e.target.value === "Old First" ? "Old First" : "New First",
            )
          }
        >
          <SelectOption value="New First">New First</SelectOption>
          <SelectOption value="Old First">Old First</SelectOption>
        </Select>
      </div>
      <table className="min-w-full overflow-hidden">
        <thead className="bg-gray-200 text-left">
          <tr>
            <th className="px-2 py-2 text-sm">Operation</th>
            <th className="px-2 py-2 text-sm">Ticker</th>
            <th className="px-2 py-2 text-sm">Date</th>
            <th className="px-2 py-2 text-sm">Type</th>
            <th className="px-2 py-2 text-sm">Quantity</th>
            <th className="px-2 py-2 text-sm">Price</th>
            <th className="px-2 py-2 text-sm">Total Spent</th>
            <th className="px-2 py-2 text-sm">Currency</th>
            <th className="px-2 py-2 text-sm">Note</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {sortedData.map((row, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="px-2 py-2">{row.operation}</td>
              <td className="px-2 py-2">{row.ticker}</td>
              <td className="px-2 py-2 min-w-28">{row.date}</td>
              <td className="px-2 py-2">{row.type}</td>
              <td className="px-2 py-2">{row.quantity}</td>
              <td className="px-2 py-2">{row.price}</td>
              <td className="px-2 py-2">
                {(Number(row.quantity) * Number(row.price)).toFixed(2)}
              </td>
              <td className="px-2 py-2">{row.currency}</td>
              <td className="px-2 py-2">{row.note}</td>
              <td className="px-2 py-2">
                <div className="flex flex-col items-start">
                  <button onClick={() => onEdit(row.id)}>Edit</button>
                  <button onClick={() => onDelete(row.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
