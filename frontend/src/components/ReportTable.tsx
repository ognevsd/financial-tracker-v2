import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import Button from "./ui/button";
import { getAllReports } from "../api/report";

interface OperationTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ReportTable({ onEdit, onDelete }: OperationTableProps) {
  const { isLoading, data } = useQuery({
    queryFn: getAllReports,
    queryKey: ["all-reports"],
    staleTime: 120000,
  });

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (data?.report === null || data?.report === undefined) {
    return <div>No reports in DB</div>;
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
        {data?.report.map((row, index) => (
          <tr
            key={row.id}
            className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
          >
            <td className="px-4 py-2">{row.name}</td>
            <td className="px-4 py-2">
              <div className="flex flex-row space-x-1 justify-end">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onEdit(row.id)}
                >
                  <Pencil />
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onDelete(row.id)}
                >
                  <Trash2 />
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
