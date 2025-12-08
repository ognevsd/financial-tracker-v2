import { useQuery } from "@tanstack/react-query";
import { getAllAssetTypes } from "../api/assetType";

interface OperationTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function AssetTypeTable({
  onEdit,
  onDelete,
}: OperationTableProps) {
  const { isLoading, data } = useQuery({
    queryFn: getAllAssetTypes,
    queryKey: ["all-asset-types"],
    staleTime: 90000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.assetType === null) {
    return <div>No asset types in DB</div>;
  }

  return (
    <table className="overflow-hidden w-full max-w-xl">
      <thead className="bg-gray-200">
        <tr>
          <th className="px-4 py-2">Name</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {data?.assetType.map((row, index) => (
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
