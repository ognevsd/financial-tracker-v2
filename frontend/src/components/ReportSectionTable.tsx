import { useQuery } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import Button from "./ui/button";
import { getAllReports } from "../api/report";
import { getAllReportSections } from "../api/reportSection";

interface OperationTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function ReportSectionTable({
  onEdit,
  onDelete,
}: OperationTableProps) {
  const { isLoading: isReportsLoading, data: reports } = useQuery({
    queryFn: getAllReports,
    queryKey: ["all-reports"],
    staleTime: 120000,
  });

  const { isLoading, data } = useQuery({
    queryFn: () => getAllReportSections(),
    queryKey: ["all-report-sections"],
    staleTime: 120000,
  });

  if (isLoading || isReportsLoading) {
    return <div>Loading...</div>;
  }

  if (reports?.report === null) {
    return <div>No reports in DB</div>;
  }

  return (
    <div className="space-y-4">
      {reports?.report.map((report) => (
        <div key={report.id}>
          <h3>{report.name}</h3>
          {data?.reportSection === null ? (
            <div>No report sections for {report.name} in DB</div>
          ) : (
            <table className="overflow-hidden w-full max-w-2xl">
              <thead className="bg-gray-200">
                <tr>
                  <th className="px-4 py-2 min-w-100">Name</th>
                  <th className="px-4 py-2">Order Index</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {data?.reportSection.map(
                  (row, index) =>
                    row.reportId === report.id && (
                      <tr
                        key={row.id}
                        className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}
                      >
                        <td className="px-4 py-2">{row.name}</td>
                        <td className="px-4 py-2">{row.orderIndex}</td>
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
                    ),
                )}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
