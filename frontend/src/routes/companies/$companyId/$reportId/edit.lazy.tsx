import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "../../../../components/ui/button";
import { defaultLayoutData } from "../../../../lib/reportUtils";
import type {
  Layout,
  LayoutField,
  LayoutSection,
} from "../../../../types/report";
import { useEffect, useMemo, useState } from "react";
import { PlusIcon, Trash2 } from "lucide-react";
import { Input } from "../../../../components/ui/input";
import { LayoutSectionRows } from "../../../../components/LayoutSectionRows";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getLayout } from "../../../../api/layout";
import Loading from "../../../../components/Loading";
import {
  deleteField,
  swapFields,
  upsertField,
  type SwapFieldsData,
  type UpsertData,
} from "../../../../api/reportLayout";

export const Route = createLazyFileRoute(
  "/companies/$companyId/$reportId/edit",
)({
  component: RouteComponent,
});

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

function YearModification() {
  const defaultYears = [
    "2025",
    "2024",
    "2023",
    "2022",
    "2021",
    "2020",
    "2019",
    "2018",
    "2017",
    "2016",
    "2015",
    "2014",
    "2013",
    "2012",
    "2011",
    "2010",
  ];
  const [years, setYears] = useState(defaultYears);

  const onYearAdd = () => {
    setYears((prev) => [...prev, ""]);
  };

  const onYearDelete = (index: number) => {
    setYears((prev) => prev.filter((_, i) => i !== index));
  };

  const onYearChange = (index: number, newValue: string) => {
    setYears((prev) => {
      const newYears = [...prev];
      newYears[index] = newValue;
      return newYears;
    });
  };

  const handleOnBlur = () => {
    setYears((prev) => [...prev].sort((a, b) => Number(b) - Number(a)));
  };

  return (
    <>
      <h3 className="bg-slate-200">Years</h3>
      <div className="grid grid-cols-4 gap-2">
        {years.map((year, index) => {
          const isDuplicate = years.filter((y) => y === year).length > 1;
          return (
            <div
              key={index}
              className={`bg-gray-200 rounded flex items-center p-2 max-w-sm min-w-32 gap-2 
                ${isDuplicate ? "border-2 border-red-500 bg-red-50" : ""}`}
            >
              <Input
                type="text"
                placeholder="YYYY"
                maxLength={4}
                value={year}
                onBlur={handleOnBlur}
                pattern="\d{4}"
                onChange={(e) => onYearChange(index, e.target.value)}
                onKeyPress={(e) => {
                  if (!/[0-9]/.test(e.key)) {
                    e.preventDefault();
                  }
                }}
              />
              <Button variant="secondary" onClick={() => onYearDelete(index)}>
                <Trash2 />
              </Button>
            </div>
          );
        })}
        <Button onClick={onYearAdd}>
          <PlusIcon />
        </Button>
      </div>
    </>
  );
}

function RouteComponent() {
  // Navigation
  const navigate = useNavigate();
  const { companyId, reportId } = Route.useParams();

  // State
  // const [data, setData] = useState<Layout>(defaultLayoutData);
  const [flatFields, setFlatFields] = useState<
    Record<string, Array<LayoutField>>
  >({});

  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryFn: () => getLayout(reportId, companyId),
    queryKey: [companyId, reportId, "layout"],
    staleTime: 120_000,
  });

  // const [flatFields, setFlatFields] = useState(() =>
  //   flattenLayout(data?.layout ?? []),
  // );

  useEffect(() => {
    if (data?.layout) {
      setFlatFields(flattenLayout(data.layout));
    }
  }, [data?.layout]);

  const upsertFieldMutation = useMutation({
    mutationFn: (data: UpsertData) => upsertField(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [companyId, reportId, "layout"],
      });
    },
  });
  const deleteFieldMutation = useMutation({
    mutationFn: (id: string) => deleteField(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [companyId, reportId, "layout"],
      });
    },
  });
  const swapFieldsMutation = useMutation({
    mutationFn: (data: SwapFieldsData) => swapFields(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [companyId, reportId, "layout"],
      });
    },
  });

  if (isLoading) {
    return <Loading />;
  }

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

  const handleFieldBlur = (
    sectionId: string,
    fieldId: string,
    value: string,
    orderIndex: number,
  ) => {
    // if (value === "") return; // NOTE: Do nothing if field is empty string
    //
    upsertFieldMutation.mutate({
      companyId: companyId,
      reportId: reportId,
      sectionId: sectionId,
      fieldId: fieldId,
      orderIndex: orderIndex,
      name: value,
    });
  };

  const handleDeleteField = (sectionId: string, fieldId: string) => {
    deleteFieldMutation.mutate(fieldId);
    setFlatFields((prev) => {
      return {
        ...prev,
        [sectionId]: prev[sectionId].filter((field) => field.id !== fieldId),
      };
    });
  };

  const handleSwapFields = (
    sectionId: string,
    index1: number,
    index2: number,
  ) => {
    const fieldOne = flatFields[sectionId].find(
      (item) => item.orderIndex == index1 + 1,
    );
    const fieldTwo = flatFields[sectionId].find(
      (item) => item.orderIndex == index2 + 1,
    );
    if (!fieldOne || !fieldTwo) {
      console.error("Cannot swap missing fields");
      return;
    }
    swapFieldsMutation.mutate({
      fieldIdOne: fieldOne.id,
      fieldIdTwo: fieldTwo.id,
      orderIndexOne: index1 + 1,
      orderIndexTwo: index2 + 1,
    });
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

  return (
    <div className="space-y-2">
      <YearModification />
      <hr />
      {data?.layout.map((section) => (
        <LayoutSectionRows
          key={section.id}
          section={section}
          flatFields={flatFields}
          onAddField={(sectionId: string) => addField(sectionId)}
          onDeleteField={(sectionId: string, fieldId: string) =>
            handleDeleteField(sectionId, fieldId)
          }
          onNameChange={(sectionId: string, fieldId: string, newName: string) =>
            changeName(sectionId, fieldId, newName)
          }
          onSwapFields={(sectionId: string, index1: number, index2: number) =>
            handleSwapFields(sectionId, index1, index2)
          }
          onFieldBlur={(
            sectionId: string,
            fieldId: string,
            value: string,
            orderIndex: number,
          ) => handleFieldBlur(sectionId, fieldId, value, orderIndex)}
        />
      ))}
    </div>
  );
}
