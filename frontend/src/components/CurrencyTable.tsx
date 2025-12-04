import { useQuery } from "@tanstack/react-query";
import { getAllCurrencies } from "../api/currency";

interface CurrencyTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function CurrencyTable({
  onEdit,
  onDelete,
}: CurrencyTableProps) {
  const { isLoading, data } = useQuery({
    queryKey: ["all-currencies"],
    queryFn: () => getAllCurrencies(),
    staleTime: 30000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <table className="overflow-hidden">
      <thead className="bg-gray-200">
        <tr>
          <th className="px-4 py-2">Code</th>
          <th className="px-4 py-2">Name</th>
          <th className="px-4 py-2">Decimals</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {data?.map((row, index) => (
          <tr
            key={row.id}
            className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
          >
            <td className="px-4 py-2">{row.code}</td>
            <td className="px-4 py-2">{row.name}</td>
            <td className="px-4 py-2">{row.decimals}</td>
            <td className="px-4 py-2 flex flex-col items-start">
              <button onClick={() => onEdit(row.id)}>Edit</button>
              <button onClick={() => onDelete(row.id)}>Delete</button>
            </td>
          </tr>
        ))}
        {data?.length === 0 && (
          <tr>
            <td colSpan={4} className="text-center py-4 text-gray-500">
              No currency data
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}
