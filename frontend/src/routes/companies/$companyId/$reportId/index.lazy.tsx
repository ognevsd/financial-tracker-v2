import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "../../../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { Fragment, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { defaultData } from "../../../../lib/reportUtils";
import type {
  EditValue,
  FlatReport,
  Report,
  Section,
  Year,
} from "../../../../types/report";
import SectionRows from "../../../../components/SectionRows";
import ValueCell from "../../../../components/ValueCell";

export const Route = createLazyFileRoute("/companies/$companyId/$reportId/")({
  component: RouteComponent,
});

// function addYearToSections(sections: Section[], year: Year): Section[] {
//   return sections.map((section) => ({
//     ...section,
//     fields: section.fields.map((field) => ({
//       ...field,
//       values: { ...field.values, [year]: field.values[year] ?? "" },
//     })),
//     sections: addYearToSections(section.sections, year),
//   }));
// }
//
// function addYear(report: Report, year: Year): Report {
//   if (report.years.includes(year)) {
//     return report;
//   }
//   const years = [...data.years, year].sort((a, b) => b - a);
//
//   return {
//     ...report,
//     years: years,
//     sections: addYearToSections(data.sections, year),
//   };
// }

function flattenSections(sections: Section[]): FlatReport {
  let values: FlatReport = {};

  sections.forEach((section) => {
    section.fields.forEach((field) => {
      values[field.id] = field.values;
    });
    const tmpFields = flattenSections(section.sections);
    values = { ...values, ...tmpFields };
  });

  return values;
}

function RouteComponent() {
  // Routing
  const { companyId, reportId } = Route.useParams();
  const navigate = useNavigate();
  const editPath = "/companies/$companyId/$reportId/edit";

  // State
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [data, setData] = useState<Report>(defaultData);

  const initialFlatFields = useMemo(
    () => flattenSections(data.sections),
    [data.sections],
  );
  const [fieldValues, setFieldValues] = useState<FlatReport>(initialFlatFields);

  const years = useMemo(() => data.years, [data.years]);
  const sections = useMemo(() => data.sections, [data.sections]);

  const onEditToggle = () => {
    if (isEdit) {
      setIsEdit(false);
      return;
    }
    setIsEdit(true);
  };

  function onChangeCell(fieldId: string, year: Year, newValue: EditValue) {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: {
        ...prev[fieldId],
        [year]: newValue === "" ? 0 : newValue,
      },
    }));
  }

  function onYearChange() {
    console.log("Woops, year is changing");
  }

  function onAddYear() {
    console.log("Hey, to many years :D");
  }

  return (
    <div>
      <div className="flex justify-end space-x-2 space-y-2">
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
                  <ValueCell
                    isFinancial={false}
                    isEditing={isEdit}
                    value={year}
                    onChangeValue={onYearChange}
                  />
                </th>
              ))}
              {isEdit && (
                <th className="px-4 py-2">
                  <Button type="button" size="sm" onClick={() => onAddYear()}>
                    <Plus />
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
                flatReport={fieldValues}
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
