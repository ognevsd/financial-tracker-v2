import { useQuery } from "@tanstack/react-query";
import { ListTree, Pencil, Trash2 } from "lucide-react";
import Button from "./ui/button";
import { getAllReports } from "../api/report";
import { getAllReportSections } from "../api/reportSection";
import type { ReportSectionTableData } from "../types/reportSection";

interface OperationTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubsection: (id: string, parentName: string) => void;
}

const buildSectionHierarchy = (items: ReportSectionTableData[]) => {
  const itemMap = {};
  const roots = [];

  items.forEach((item) => {
    itemMap[item.id] = { ...item, children: [] };
  });

  items.forEach((item) => {
    if (item.parentId === "" || item.parentId === null) {
      roots.push(itemMap[item.id]);
    } else if (itemMap[item.parentId]) {
      itemMap[item.parentId].children.push(itemMap[item.id]);
    }
  });

  return roots;
};

export default function ReportSectionTable({
  onEdit,
  onDelete,
  onAddSubsection,
}: OperationTableProps) {
  const { isLoading: isReportsLoading, data: reports } = useQuery({
    queryFn: getAllReports,
    queryKey: ["all-reports"],
    staleTime: 120000,
  });

  const { isLoading, data } = useQuery({
    queryFn: () => getAllReportSections(),
    queryKey: ["report-section", "all"],
    staleTime: 120000,
  });

  if (isLoading || isReportsLoading) {
    return <div>Loading...</div>;
  }

  if (reports?.report === null) {
    return <div>No reports in DB</div>;
  }

  const hierarchy = buildSectionHierarchy(data?.reportSection);

  console.log(hierarchy);

  return (
    <div className="space-y-4">
      {reports?.report.map((report) => (
        <div key={report.id}>
          <h3>{report.name}</h3>
          {data?.reportSection === null ? (
            <div>No report sections for {report.name} in DB</div>
          ) : (
            <table className="overflow-hidden w-full max-w-3xl">
              <thead className="bg-gray-200 text-left">
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
                              onClick={() => onAddSubsection(row.id, row.name)}
                            >
                              <ListTree />
                            </Button>
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
