import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import type { LayoutField, LayoutSection } from "../types/report";
import Button from "./ui/button";
import { Input } from "./ui/input";

interface LayoutRowProps {
  section: LayoutSection;
  flatFields: Record<string, Array<LayoutField>>;
  onAddField: (sectionId: string) => void;
  onDeleteField: (sectionId: string, fieldId: string) => void;
  onNameChange: (sectionId: string, fieldId: string, newName: string) => void;
  onSwapFields: (sectionId: string, index1: number, index2: number) => void;
  onFieldBlur: (sectionId: string, fieldId: string, value: string) => void;
}

export function LayoutSectionRows({
  section,
  flatFields,
  onAddField,
  onDeleteField,
  onNameChange,
  onSwapFields,
  onFieldBlur,
}: LayoutRowProps) {
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
          {(flatFields[section.id] ?? []).map((field, index, arr) => (
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
                  onBlur={(e) =>
                    onFieldBlur(section.id, field.id, e.target.value)
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
          onFieldBlur={(sectionId: string, fieldId: string, value: string) =>
            onFieldBlur(sectionId, fieldId, value)
          }
        />
      ))}
    </>
  );
}
