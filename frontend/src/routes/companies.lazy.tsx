import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { MoveDown, MoveUp, Trash2 } from "lucide-react";
import Button from "../components/ui/button";
import { Input } from "../components/ui/input";

export const Route = createLazyFileRoute("/companies")({
  component: RouteComponent,
});

const incomeStatement = {
  company_id: 123,
  years: [2024, 2023, 2022],
  sections: {
    revenue: [
      {
        taxonomy: "",
        order: 1,
        label: "Net sales",
        data: [279030, 244264, 226222],
      },
      {
        taxonomy: "",
        order: 2,
        label: "Other operating revenues",
        data: [279793, 245088, 226740],
      },
    ],
    expenses: [
      {
        taxonomy: "",
        label: "Cost of goods sold",
        data: [151057, 134228, 126440],
      },
    ],
  },
};

const bsMapping = [
  {
    id: "a",
    taxonomy_id: "a",
    taxonomy_name: "BS_PPE",
    original_name: "Prperty, plant, equipment",
    report_id: "a",
    section_id: "a",
    order_index: 1,
  },
  {
    id: "b",
    taxonomy_id: "b",
    taxonomy_name: "BS_CASH",
    original_name: "Cash and cash equivalents",
    report_id: "a",
    section_id: "b",
    order_index: 1,
  },
  {
    id: "c",
    taxonomy_id: "c",
    taxonomy_name: "BS_INV",
    original_name: "Inventories",
    report_id: "a",
    section_id: "b",
    order_index: 2,
  },
  {
    id: "d",
    taxonomy_id: "",
    taxonomy_name: "",
    original_name: "Current Assets",
    report_id: "a",
    section_id: "b",
    order_index: 3,
  },
];

const reports = [
  {
    id: "a",
    name: "Balance Sheet",
  },
];

const sections = [
  {
    id: "a",
    report_id: "a",
    name: "Non-Current Assets",
  },
  {
    id: "b",
    report_id: "a",
    name: "Current Assets",
  },
];

const taxonomy = [
  {
    id: "a",
    name: "BS_PPE",
  },
  {
    id: "b",
    name: "BS_CASH",
  },
  {
    id: "c",
    name: "BS_ASS",
  },
];

// Doing setup for revenue in fin report
function RouteComponent() {
  const [bsFields, setBsFields] = useState(bsMapping);

  const bsId = reports.find((item) => item.name === "Balance Sheet")?.id;
  const bsSections = sections.filter((item) => item.report_id === bsId);

  const updateField = (value: string, field: string, field_id: string) => {
    setBsFields((prevState) =>
      prevState.map((item) =>
        item.id === field_id ? { ...item, [field]: value } : item,
      ),
    );
  };

  const onSaveButton = () => {
    console.log(bsFields);
  };
  const onCancelButton = () => {
    console.log("Cancel not working");
  };
  const moveRow = (index: number, direction: number, section_id: string) => {
    console.log("moveRow");
  };

  const onUpButton = (index: number, section_id: string) => {
    console.log("Up");
    moveRow(index, -1, section_id);
  };
  const onDownButton = (index: number, section_id: string) => {
    console.log("Down");
    moveRow(index, -1, section_id);
  };
  const onDeleteButton = () => {
    console.log("Delete");
  };

  return (
    <div className="space-y-2">
      <div className="flex gap-3 items-center">
        <Button onClick={onSaveButton}>Save</Button>
        <Button variant="secondary" onClick={onCancelButton}>
          Cancel
        </Button>
      </div>

      {/* Table settings */}
      <h2>Balance Sheet</h2>
      {bsSections.map((section) => (
        <div key={`${section.id}-table`}>
          <h3 key={section.id}>{section.name}</h3>
          <table key={`${section.id}-table`}>
            <thead className="bg-gray-200">
              <tr>
                <th className="px-4 py-2">#</th>
                <th className="px-4 py-2 min-w-50">Taxonomy</th>
                <th className="px-4 py-2 min-w-sm">Original Name</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {bsFields
                .filter((item) => item.section_id === section.id)
                .slice()
                .sort((a, b) => a.order_index - b.order_index)
                .map((item, index, sectionItems) => (
                  <tr key={item.id}>
                    <td className="px-2 py-2">{item.order_index}</td>
                    <td className="px-2 py-2">
                      <Input
                        value={item.taxonomy_name}
                        onChange={(e) =>
                          updateField(e.target.value, "taxonomy_name", item.id)
                        }
                      />
                    </td>
                    <td className="px-2 py-2">
                      <Input
                        value={item.original_name}
                        onChange={(e) =>
                          updateField(e.target.value, "original_name", item.id)
                        }
                      />
                    </td>
                    <td className="px-2 py-2 space-x-1">
                      <Button
                        type="button"
                        disabled={index === 0 ? true : false}
                        variant="secondary"
                        onClick={() => {
                          onUpButton(index, section.id, item.id);
                        }}
                      >
                        <MoveUp size={16} />
                      </Button>
                      <Button
                        disabled={
                          index === sectionItems.length - 1 ? true : false
                        }
                        onClick={onDownButton}
                        variant="secondary"
                      >
                        <MoveDown size={16} />
                      </Button>
                      <Button onClick={onDeleteButton} variant="secondary">
                        <Trash2 />
                      </Button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ))}

      {/* Financial info */}
      <table>
        <thead className="bg-gray-200">
          <tr>
            <th className="px-4 py-2">Field</th>
            {incomeStatement.years.map((year) => (
              <th key={year} className="px-4 py-2">
                {year}
              </th>
            ))}
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  );
}
