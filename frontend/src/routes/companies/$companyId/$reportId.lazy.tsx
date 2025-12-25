import { createLazyFileRoute } from "@tanstack/react-router";
import Button from "../../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import {
  getAllReportSections,
  getReportSectionById,
} from "../../../api/reportSection";

export const Route = createLazyFileRoute("/companies/$companyId/$reportId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { companyId, reportId } = Route.useParams();
  const [isEdit, setIsEdit] = useState<boolean>(false);

  const { data: reportSections, isLoading: isReportSectionsLoading } = useQuery(
    {
      queryFn: () => getAllReportSections({ reportId: reportId }),
      queryKey: ["report-sections", reportId],
      staleTime: 120_000,
    },
  );

  console.log(reportSections);

  // const {data: reportFields, isLoading: isReportFieldsLoading}
  // const {data: fieldValues, isLoading: isReportFieldValuesLoading}

  return (
    <div>
      Hello `/companies/{companyId}/{reportId}`!
      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            setIsEdit((prev) => !prev);
          }}
        >
          {isEdit ? "Save" : "Edit Data"}
        </Button>
        <Button type="button" variant="secondary">
          Edit Fields
        </Button>
      </div>
      <div>
        <table>
          <thead className="bg-gray-200">
            <tr>
              <th className="px-4 py-2">Field Name</th>
              {isEdit && (
                <th className="px-4 py-2">
                  <Button type="button">Add Year</Button>
                </th>
              )}
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
}
