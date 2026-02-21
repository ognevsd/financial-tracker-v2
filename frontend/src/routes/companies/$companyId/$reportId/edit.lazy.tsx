import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import type { LayoutField, LayoutSection } from "../../../../types/report";
import { useEffect, useState } from "react";
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
import { YearModification } from "../../../../components/YearModification";

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
      <YearModification companyId={companyId} reportId={reportId} />
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
