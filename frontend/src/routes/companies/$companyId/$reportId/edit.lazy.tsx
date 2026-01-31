import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import { buildSectionHierarchy, type Hierarchy } from "../../../../lib/utils";
import { useQuery } from "@tanstack/react-query";
import { getAllReportSections } from "../../../../api/reportSection";
import { Fragment } from "react/jsx-runtime";
import Button from "../../../../components/ui/button";
import { defaultLayoutData } from "../../../../lib/reportUtils";
import type {
  Layout,
  LayoutField,
  LayoutSection,
} from "../../../../types/report";
import { useEffect, useMemo, useState } from "react";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { Input } from "../../../../components/ui/input";

export const Route = createLazyFileRoute(
  "/companies/$companyId/$reportId/edit",
)({
  component: RouteComponent,
});

console.log(defaultLayoutData);

interface LayoutRowProps {
  section: LayoutSection;
  flatFields: Record<string, Array<LayoutField>>;
  onAddField: (sectionId: string) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onNameChange: (sectionId: string, fieldId: string, newName: string) => void;
  onSwapFields: (sectionId: string, index1: number, index2: number) => void;
}

function LayoutSectionRows({
  section,
  flatFields,
  onAddField,
  onDeleteField,
  onNameChange,
  onSwapFields,
}: LayoutRowProps) {
  // console.log("flatFields", flatFields);
  // console.log(section.name, flatFields[section.id]);
  function moveUp() {
    console.log("UP");
  }
  function moveDown() {
    console.log("DOWN");
  }
  return (
    <>
      <h3 className="bg-slate-200">{section.name}</h3>
      {/* Fields */}
      <table>
        <thead className="bg-gray-200">
          <tr>
            <th className="px-2 py-2">Order Index</th>
            <th className="px-2 py-2">Name</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {flatFields[section.id].map((field, index, arr) => (
            <tr key={field.id}>
              <td className="px-2 py-2">{field.orderIndex}</td>
              <td className="px-2 py-2">
                <Input
                  type="text"
                  id={field.id}
                  value={field.name}
                  onChange={(e) =>
                    onNameChange(section.id, field.id, e.target.value)
                  }
                />
              </td>
              <td>
                <div className="space-x-0.5">
                  <Button
                    variant="secondary"
                    disabled={index === 0}
                    onClick={() => onSwapFields(section.id, index, index - 1)}
                  >
                    <ArrowUp />
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={index === arr.length - 1}
                    onClick={() => onSwapFields(section.id, index, index + 1)}
                  >
                    <ArrowDown />
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => onDeleteField(section.id, field.id)}
                  >
                    <Trash2 />
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="secondary" onClick={() => onAddField(section.id)}>
        Add Field
      </Button>

      {/* Children */}
      {section.sections.map((section) => (
        <LayoutSectionRows
          key={section.id}
          section={section}
          flatFields={flatFields}
          onAddField={(sectionId: string) => onAddField(sectionId)}
          onDeleteField={(sectionId: string, fieldId: string) =>
            onDeleteField(sectionId, fieldId)
          }
          onNameChange={(sectionId: string, fieldId: string, newName: string) =>
            onNameChange(sectionId, fieldId, newName)
          }
          onSwapFields={(sectionId: string, index1: number, index2: number) =>
            onSwapFields(sectionId, index1, index2)
          }
        />
      ))}
    </>
  );
}

function flattenLayout(
  sections: LayoutSection[],
): Record<string, Array<LayoutField>> {
  let flatFields: Record<string, Array<LayoutField>> = {};

  sections.forEach((section) => {
    if (!flatFields[section.id]) {
      flatFields[section.id] = [];
    }
    section.fields.forEach((field) => {
      flatFields[section.id].push(field);
    });
    const tmpFields = flattenLayout(section.sections);
    flatFields = { ...flatFields, ...tmpFields };
  });

  return flatFields;
}

function RouteComponent() {
  // Navigation
  const navigate = useNavigate();
  const { companyId, reportId } = Route.useParams();

  // State
  const [data, setData] = useState<Layout>(defaultLayoutData);

  // const flatFields = useMemo(
  //   () => flattenLayout(data.sections),
  //   [data.sections],
  // );
  const [flatFields, setFlatFields] = useState(() =>
    flattenLayout(data.sections),
  );
  const addField = (sectionId: string) => {
    setFlatFields((prev) => {
      // id is needed to provide unique key for rendering, in backend it will be
      // replaced with proper id
      const id = `${sectionId}-${Date.now()}`;
      const orderIndex = prev[sectionId].length + 1;
      return {
        ...prev,
        [sectionId]: [
          ...prev[sectionId],
          { id: id, name: "", orderIndex: orderIndex },
        ],
      };
    });
  };

  const deleteField = (sectionId: string, fieldId: string) => {
    setFlatFields((prev) => {
      return {
        ...prev,
        [sectionId]: prev[sectionId].filter((field) => field.id !== fieldId),
      };
    });
  };

  const swapFields = (sectionId: string, index1: number, index2: number) => {
    setFlatFields((prev) => {
      const newFields = { ...prev };
      const newArr = [...newFields[sectionId]];
      const item1 = {
        ...newArr[index1],
        orderIndex: newArr[index2].orderIndex,
      };
      const item2 = {
        ...newArr[index2],
        orderIndex: newArr[index1].orderIndex,
      };
      newArr[index1] = item2;
      newArr[index2] = item1;
      // [newArr[index1], newArr[index2]] = [newArr[index2], newArr[index1]];
      newFields[sectionId] = newArr;
      return newFields;
    });
  };

  const changeName = (sectionId: string, fieldId: string, newName: string) => {
    setFlatFields((prev) => {
      return {
        ...prev,
        [sectionId]: prev[sectionId].map((field) =>
          field.id === fieldId ? { ...field, name: newName } : field,
        ),
      };
    });
  };

  // // Re-sync when source data changes
  // useEffect(() => {
  //   setFlatFields(flattenLayout(data.sections));
  // }, [data.sections]);

  return (
    <div className="space-y-2">
      {data.sections.map((section) => (
        <LayoutSectionRows
          key={section.id}
          section={section}
          flatFields={flatFields}
          onAddField={(sectionId: string) => addField(sectionId)}
          onDeleteField={(sectionId: string, fieldId: string) =>
            deleteField(sectionId, fieldId)
          }
          onNameChange={(sectionId: string, fieldId: string, newName: string) =>
            changeName(sectionId, fieldId, newName)
          }
          onSwapFields={(sectionId: string, index1: number, index2: number) =>
            swapFields(sectionId, index1, index2)
          }
        />
      ))}
    </div>
  );
}
