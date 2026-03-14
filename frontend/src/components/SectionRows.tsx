import {
  calculateIndent,
  formatCurrency,
  sumSectionByYear,
} from "../lib/reportUtils";
import type { FlatReport, Section, Year } from "../types/report";
import ValueCell from "./ValueCell";

interface RowProps {
  section: Section;
  flatReport: FlatReport;
  years: number[];
  level?: number;
  isEditing: boolean;
  onChangeCell: (fieldId: string, year: Year, newValue: number) => void;
  onBlur: (fieldId: string, year: Year, newValue: number) => void;
}

export default function SectionRows({
  section,
  flatReport,
  years,
  level = 0,
  isEditing,
  onChangeCell,
  onBlur,
}: RowProps) {
  const indent = calculateIndent(level);
  const totals = sumSectionByYear(section, flatReport, years);

  return (
    <>
      {/* Fields */}
      {section.fields.map((field) => (
        <tr key={field.id} className="border-t border-slate-200 bg-white">
          <td className={`py-2 pr-2 ${indent} sticky left-0 z-10 bg-white`}>
            {field.name}
          </td>
          {years.map((year) => (
            <td key={year} className="py-2 px-2 text-right tabular-nums">
              <ValueCell
                isFinancial={true}
                isEditing={isEditing}
                value={flatReport[field.id]?.[year] ?? ""}
                onChangeValue={(newValue) =>
                  onChangeCell(field.id, year, Number(newValue))
                }
                onBlur={(newValue) => onBlur(field.id, year, newValue)}
              />
            </td>
          ))}
        </tr>
      ))}

      {/* Children */}
      {section.sections.map((child) => (
        <SectionRows
          key={child.id}
          section={child}
          flatReport={flatReport}
          years={years}
          level={level + 1}
          isEditing={isEditing}
          onChangeCell={onChangeCell}
          onBlur={onBlur}
        />
      ))}

      {/* Subtotal */}
      <tr
        className={`border-t border-slate-300 ${level === 0 ? "bg-gray-100" : "bg-white"}`}
      >
        <td
          className={`py-2 pr-2 ${indent} ${level === 0 ? "font-bold" : "font-semibold"} sticky left-0 z-10 ${level === 0 ? "bg-gray-100" : "bg-white"}`}
        >
          {section.name}
        </td>
        {years.map((y) => (
          <td
            key={y}
            className={`py-2 px-2 text-right tabular-nums ${level === 0 ? "font-bold" : "font-semibold"}`}
          >
            {formatCurrency(totals[y] ?? 0)}
          </td>
        ))}
      </tr>
    </>
  );
}
