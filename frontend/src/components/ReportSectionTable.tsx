import { useQuery } from "@tanstack/react-query";
import { ListTree, Pencil, Trash2 } from "lucide-react";
import Button from "./ui/button";
import { getAllReports } from "../api/report";
import { getAllReportSections } from "../api/reportSection";
import type { ReportSectionTableData } from "../types/reportSection";
import { Fragment } from "react/jsx-runtime";
import { GLYPH } from "../lib/utils";

interface OperationTableProps {
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onAddSubsection: (id: string, parentName: string) => void;
}

interface Hierarchy extends ReportSectionTableData {
  children: Hierarchy[];
}

const buildSectionHierarchy = (
  items: ReportSectionTableData[],
): Hierarchy[] => {
  const itemMap: Record<string, Hierarchy> = {};
  const roots: Hierarchy[] = [];

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

const calculatePrefix = (level: number): string => {
  if (level === 0) {
    return "";
  }
  return "└" + "─".repeat(Math.max(0, level - 1)) + " ";
};

export default function ReportSectionTable({
  onEdit,
  onDelete,
  onAddSubsection,
}: OperationTableProps) {
  const renderRow = (item: Hierarchy, level: number, index: number) => {
    const prefix = calculatePrefix(level);

    return (
      <Fragment key={item.id}>
        <tr className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
          <td className="px-4 py-2">
            {prefix}
            {item.name}
          </td>
          <td className="px-4 py-2">{item.orderIndex}</td>
          <td className="px-4 py-2">
            <div className="flex flex-row space-x-1 justify-end">
              <Button
                type="button"
                variant="secondary"
                onClick={() => onAddSubsection(item.id, item.name)}
              >
                <ListTree />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onEdit(item.id)}
              >
                <Pencil />
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onDelete(item.id)}
              >
                <Trash2 />
              </Button>
            </div>
          </td>
        </tr>
        {item.children.map((child) => renderRow(child, level + 1, index + 1))}
      </Fragment>
    );
  };

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

  const hierarchy = buildSectionHierarchy(data?.reportSection || []);

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
                {hierarchy.map((item, index) => renderRow(item, 0, index))}
              </tbody>
            </table>
          )}
        </div>
      ))}
    </div>
  );
}
