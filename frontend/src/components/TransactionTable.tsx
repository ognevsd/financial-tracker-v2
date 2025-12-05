import { useQuery } from "@tanstack/react-query";
import { Card } from "./ui/card";
import { getAllTransactions } from "../api/transaction";
import { getAllCurrencies } from "../api/currency";
import { getAllOperations } from "../api/operations";
import { getAllAssetTypes } from "../api/assetType";

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

  const { data: currencies, isPending: isCurrenciesPending } = useQuery({
    queryFn: getAllCurrencies,
    queryKey: ["all-currencies"],
    staleTime: 120_000,
  });

  const { data: operations, isPending: isOperationsPending } = useQuery({
    queryFn: getAllOperations,
    queryKey: ["all-operations"],
    staleTime: 120_000,
  });

  const { data: assetTypes, isPending: isAssetTypePeding } = useQuery({
    queryFn: getAllAssetTypes,
    queryKey: ["all-asset-types"],
    staleTime: 120_000,
  });

  if (
    isLoading ||
    isCurrenciesPending ||
    isOperationsPending ||
    isAssetTypePeding
  ) {
    return <div>Loading...</div>;
  }

  if (data?.transaction === null) {
    return <div>No transactions in DB</div>;
  }

  return (
    <Card>
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
          {data?.transaction.map((row, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
            >
              <td className="px-2 py-2">
                {
                  operations?.operation.find(
                    (item) => item.id === row.operation,
                  )?.name
                }
              </td>
              <td className="px-2 py-2">{row.ticker}</td>
              <td className="px-2 py-2 min-w-28">{row.date}</td>
              <td className="px-2 py-2">
                {
                  assetTypes?.assetType.find((item) => item.id === row.type)
                    ?.name
                }
              </td>
              <td className="px-2 py-2">{row.quantity}</td>
              <td className="px-2 py-2">{row.price}</td>
              <td className="px-2 py-2">
                {(row.quantity * row.price).toFixed(2)}
              </td>
              <td className="px-2 py-2">
                {currencies?.find((item) => item.id === row.currency)?.code}
              </td>
              <td className="px-2 py-2">{row.note}</td>
              <td className="px-2 py-2">
                <div className="flex flex-col items-start">
                  <button onClick={() => onEdit(row.id)}>Edit</button>
                  <button onClick={() => onDelete(row.id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan={9} className="text-center py-2 text-gray-500">
                No transactions available
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Card>
  );
}
