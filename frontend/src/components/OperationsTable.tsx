import { useQuery } from "@tanstack/react-query";
import { getAllOperations } from "../api/operations";

interface OperationTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function OperationsTable({
  onEdit,
  onDelete,
}: OperationTableProps) {
  const { isLoading, data } = useQuery({
    queryFn: getAllOperations,
    queryKey: ["all-operations"],
    staleTime: 90000,
  });

  // console.log(data)

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.operation === null) {
    return <div>No operations in DB</div>;
  }

  return (
    <table className="overflow-hidden">
      <thead className="bg-gray-200">
        <tr>
          <th className="px-4 py-2">Name</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {data?.operation.map((row, index) => (
          <tr
            key={row.id}
            className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
          >
            <td className="px-4 py-2">{row.name}</td>
            <td className="px-4 py-2">
              <div className="flex flex-col items-start">
                <button onClick={() => onEdit(row.id)}>Edit</button>
                <button onClick={() => onDelete(row.id)}>Delete</button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
