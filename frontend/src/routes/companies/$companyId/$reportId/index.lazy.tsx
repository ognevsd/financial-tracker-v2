import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";
import Button from "../../../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import {
  getAllReportSections,
  getReportSectionById,
} from "../../../../api/reportSection";
import Loading from "../../../../components/Loading";

export const Route = createLazyFileRoute("/companies/$companyId/$reportId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { companyId, reportId } = Route.useParams();
  const [isEdit, setIsEdit] = useState<boolean>(false);
  const navigate = useNavigate();

  const editPath = "/companies/$companyId/$reportId/edit";

  const { data: reportSections, isLoading: isReportSectionsLoading } = useQuery(
    {
      queryFn: () => getAllReportSections({ reportId: reportId }),
      queryKey: ["report-section", reportId],
      staleTime: 120_000,
    },
  );

  const sortedReportSections = useMemo(() => {
    if (!reportSections?.reportSection) return [];
    return [...reportSections.reportSection].sort((a, b) => {
      return Number(a.orderIndex) - Number(b.orderIndex);
    });
  }, [reportSections]);

  // const {data: reportFields, isLoading: isReportFieldsLoading}
  // const {data: fieldValues, isLoading: isReportFieldValuesLoading}

  if (isReportSectionsLoading) {
    return <Loading />;
  }

  console.log(sortedReportSections);

  return (
    <div>
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
              <th className="px-4 py-2">Field Name</th>
              {isEdit && (
                <th className="px-4 py-2">
                  <Button type="button" size="sm">
                    Add Year
                  </Button>
                </th>
              )}
            </tr>
          </thead>
        </table>
      </div>
    </div>
  );
}
