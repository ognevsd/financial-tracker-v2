import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "../../../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useMemo, useState } from "react";
import {
  getAllReportSections,
  getReportSectionById,
} from "../../../../api/reportSection";
import Loading from "../../../../components/Loading";
import { buildSectionHierarchy } from "../../../../lib/utils";
import { Input } from "../../../../components/ui/input";

export const Route = createLazyFileRoute("/companies/$companyId/$reportId/")({
  component: RouteComponent,
});

type Year = number;
type EditValue = number | "";

interface Field {
  id: string;
  name: string;
  values: Record<Year, number>;
}

interface Section {
  id: string;
  name: string;
  sections: Section[];
  fields: Field[];
}

interface Report {
  years: Year[];
  sections: Section[];
}

function addYearToSections(sections: Section[], year: Year): Section[] {
  return sections.map((section) => ({
    ...section,
    fields: section.fields.map((field) => ({
      ...field,
      values: { ...field.values, [year]: field.values[year] ?? "" },
    })),
    sections: addYearToSections(section.sections, year),
  }));
}

function addYear(report: Report, year: Year): Report {
  if (report.years.includes(year)) {
    return report;
  }
  const years = [...data.years, year].sort((a, b) => b - a);

  return {
    ...report,
    years: years,
    sections: addYearToSections(data.sections, year),
  };
}

function ValueCell({
  isEditing,
  value,
  onChangeValue,
}: {
  isEditing: boolean;
  value: EditValue;
  onChangeValue: (v: EditValue) => void;
}) {
  if (!isEditing) {
    const n = value === "" ? 0 : value;
    return <span className="tabular-nums">{formatCurrency(n)}</span>;
  }

  return (
    <Input
      type="number"
      inputMode="decimal"
      value={value === "" ? "" : Number(value)}
      onChange={(e) => {
        const raw = e.target.value;
        if (raw === "") return onChangeValue("");
        const n = Number(raw);
        if (!Number.isNaN(n)) onChangeValue(n);
      }}
    />
  );
}

const data: Report = {
  years: [2024, 2023],
  sections: [
    {
      id: "totalassets",
      name: "Total Assets",
      sections: [
        {
          id: "currentassets",
          name: "Current Assets",
          sections: [],
          fields: [
            {
              id: "reinvest",
              name: "Real estate investments",
              values: {
                2024: 4513734,
                2023: 4617261,
              },
            },
            {
              id: "loans",
              name: "Loans receivable and other investments",
              values: {
                2024: 442584,
                2023: 420624,
              },
            },
            {
              id: "investimentinunconsolidated",
              name: "Investment in unconsolidated joint ventures",
              values: {
                2024: 121803,
                2023: 136843,
              },
            },
          ],
        },
        {
          id: "noncurrentassets",
          name: "Non-Current Assets",
          sections: [],
          fields: [
            {
              id: "cash",
              name: "Cash and cash equivalents",
              values: {
                2024: 60468,
                2023: 41285,
              },
            },
            {
              id: "restrinctedcash",
              name: "Restricted cash",
              values: {
                2024: 5871,
                2023: 5434,
              },
            },
          ],
        },
      ],
      fields: [],
    },
    {
      id: "totallian",
      name: "Total Liabilities",
      sections: [
        {
          id: "currentlia",
          name: "Current Liabilities",
          sections: [],
          fields: [
            {
              id: "secureddebt",
              name: "Secured debt, net",
              values: {
                2024: 45316,
                2023: 47301,
              },
            },
          ],
        },
        {
          id: "NCL",
          name: "Non-Current Liabilities",
          sections: [],
          fields: [],
        },
      ],
      fields: [],
    },
  ],
};

function formatCurrency(n: number, currency: string = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    currencySign: "accounting",
    maximumFractionDigits: 0,
  }).format(n);
}

interface RowProps {
  section: Section;
  years: number[];
  level?: number;
  isEditing: boolean;
  onChangeCell: (fieldId: string, year: Year, next: EditValue) => void;
}

function sumSectionByYear(
  section: Section,
  years: Year[],
): Record<Year, number> {
  const totals = Object.fromEntries(years.map((y) => [y, 0]));

  for (const f of section.fields) {
    for (const y of years) {
      totals[y] += f.values[y] ?? 0;
    }
  }

  for (const child of section.sections) {
    const childTotals = sumSectionByYear(child, years);
    for (const y of years) {
      totals[y] += childTotals[y] ?? 0;
    }
  }

  return totals;
}

function calculateIndent(level: number): string {
  if (level === 0) {
    return "pl-2";
  }
  return "pl-6";
}

function SectionRows({
  section,
  years,
  level = 0,
  isEditing,
  onChangeCell,
}: RowProps) {
  const indent = calculateIndent(level);
  const totals = sumSectionByYear(section, years);

  return (
    <Fragment>
      {/* Fields */}
      {section.fields.map((f) => (
        <tr key={f.id} className="border-t border-slate-200 bg-white">
          <td className={`py-2 pr-2 ${indent}`}>{f.name}</td>
          {years.map((y) => (
            <td key={y} className="py-2 px-2 text-right tabular-nums">
              <ValueCell
                isEditing={isEditing}
                value={f.values[y] ?? ""}
                onChangeValue={(next) => onChangeCell(f.id, y, next)}
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
          years={years}
          level={level + 1}
          isEditing={isEditing}
          onChangeCell={onChangeCell}
        />
      ))}

      {/* Subtotal */}
      <tr
        className={`border-t border-slate-300 ${level === 0 ? "bg-gray-100" : "bg-white"}`}
      >
        <td
          className={`py-2 pr-2 ${indent} ${level === 0 ? "font-bold" : "font-semibold"}`}
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
    </Fragment>
  );
}

function updateFieldValueInSections(
  sections: Section[],
  fieldId: string,
  year: Year,
  nextValue: EditValue,
): Section[] {
  return sections.map((s) => ({
    ...s,
    fields: s.fields.map((f) =>
      f.id !== fieldId
        ? f
        : {
            ...f,
            valuesByYear: { ...f.values, [year]: nextValue },
          },
    ),
    sections: updateFieldValueInSections(s.sections, fieldId, year, nextValue),
  }));
}

function RouteComponent() {
  const { companyId, reportId } = Route.useParams();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [saved, setSaved] = useState<Report>(data);
  const [draft, setDraft] = useState<Report>(data);
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  const years = draft.years;
  const sections = useMemo(() => draft.sections, [draft.sections]);

  const onAddYear = (year: Year) => {
    setDraft((prev) => addYear(prev, year));
  };

  const onEditToggle = () => {
    if (isEdit) {
      setDraft(saved);
      setIsEdit(false);
      return;
    }
    setIsEdit(true);
  };

  const onChangeCell = (fieldId: string, year: Year, next: EditValue) => {
    setDraft((prev) => ({
      ...prev,
      sections: updateFieldValueInSections(prev.sections, fieldId, year, next),
    }));
  };

  const editPath = "/companies/$companyId/$reportId/edit";

  return (
    <div>
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onEditToggle}>
          {isEdit ? "Save" : "Edit Data"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            navigate({ to: editPath, params: { companyId, reportId } });
          }}
        >
          Edit Fields
        </Button>
      </div>
      <div>
        <table>
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Line item</th>
              {years.map((year) => (
                <th className="px-4 py-2" key={year}>
                  {year}
                </th>
              ))}
              {isEdit && (
                <th className="px-4 py-2">
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => onAddYear(2022)}
                  >
                    Add Year
                  </Button>
                </th>
              )}
            </tr>
          </thead>
          <tbody>
            {sections.map((s) => (
              <SectionRows
                key={s.id}
                section={s}
                years={data.years}
                isEditing={isEdit}
                onChangeCell={onChangeCell}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
