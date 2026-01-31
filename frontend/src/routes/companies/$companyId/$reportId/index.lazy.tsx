import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "../../../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { defaultData } from "../../../../lib/reportUtils";
import type {
  EditValue,
  FlatReport,
  Report,
  Section,
  Year,
} from "../../../../types/report";
import SectionRows from "../../../../components/SectionRows";

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

// function updateSections(
//   sections: Section[],
//   oldYear: Year,
//   newYear: Year,
// ): Section[] {
//   const newSections = sections.map((section) => {
//     const newFields = {...section.fields, }
//   })
// }

function updateData(data: Report, oldYear: Year, newYear: Year): Report {
  const newData = structuredClone(data);
  newData.years = newData.years.map((year) =>
    year === oldYear ? newYear : year,
  );
  console.log(newData);
  return newData;
}

function compressYearChange(allChanges: [Year, Year][]): [Year, Year][] {
  if (allChanges.length === 0) {
    return [];
  }
  const compressedChanges = [];

  let startChange = allChanges[0][0];
  let endChange = allChanges[0][1];
  // const prev = endChange;

  for (const change of allChanges.slice(1)) {
    if (change[0] === endChange) {
      endChange = change[1];
    } else {
      compressedChanges.push([startChange, endChange]);
      startChange = change[0];
      endChange = change[1];
    }
  }
  compressedChanges.push([startChange, endChange]);
  console.log(compressedChanges);
}

function updateFlatFields(
  flatFields: FlatReport,
  oldYear: Year,
  newYear: Year,
): FlatReport {}

function RouteComponent() {
  // Routing
  const { companyId, reportId } = Route.useParams();
  const navigate = useNavigate();
  const editPath = "/companies/$companyId/$reportId/edit";

  // State
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const [data, setData] = useState<Report>(defaultData);
  const [years, setYears] = useState<Year[]>(defaultData.years);
  const [yearChange, setYearChange] = useState<[Year, Year][]>([]);

  const initialFlatFields = useMemo(
    () => flattenSections(data.sections),
    [data.sections],
  );
  const [fieldValues, setFieldValues] = useState<FlatReport>(initialFlatFields);

  // const years = useMemo(() => data.years, [data.years]);
  const sections = useMemo(() => data.sections, [data.sections]);

  const onEditToggle = () => {
    if (isEdit) {
      setIsEdit(false);
      onSave();
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

  function onSave() {
    console.log("Saving data");
    // const newData = updateData(data, oldYear, newYear);
    // setData(newData);
    // updateFlatFields(fieldValues, oldYear, newYear);

    // Now this compressed year changes can be used to update the data. With
    // the compression, there will be less DB operations needed
    console.log(compressYearChange(yearChange));
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
          Edit Layout
        </Button>
      </div>
      <div className="max-h-[calc(100vh-125px)] max-w-full overflow-auto border border-gray-300">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2 sticky top-0 left-0 z-30 bg-gray-200">
                Line item
              </th>
              {years.map((year, index) => (
                <th
                  className="px-4 py-2 sticky top-0 z-20 bg-gray-200"
                  key={`year-column-${index}`}
                >
                  {year}
                </th>
              ))}
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
