import { useQuery } from "@tanstack/react-query";
import { Card } from "./ui/card";
import { getAllTransactions } from "../api/transaction";

interface TransactionTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TransactionTable({
  onEdit,
  onDelete,
}: TransactionTableProps) {
  const { isLoading, data } = useQuery({
    queryFn: getAllTransactions,
    queryKey: ["all-transactions"],
    staleTime: 120_000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  console.log(data)

  if (data?.transaction === null) {
    return <div>No transactions in DB</div>;
  }

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
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data?.transaction.map((row, index) => (
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
              <td className="px-4 py-2">
                <button onClick={() => onEdit(index)}>Edit</button>
                <button onClick={() => onDelete(index)}>Delete</button>
              </td>
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
