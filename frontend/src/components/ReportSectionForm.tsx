import { useEffect, type Dispatch, type SetStateAction } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Button from "./ui/button";
import { getAllReports } from "../api/report";
import type { ReportSectionFormData } from "../types/reportSection";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectOption } from "./ui/select";

interface ReportSectionFormProps {
  formData: ReportSectionFormData;
  setFormData: Dispatch<SetStateAction<ReportSectionFormData>>;
  onSubmit: () => void;
  onClear: () => void;
  isEdit: boolean;
}

export default function ReportSectionForm({
  formData,
  setFormData,
  onSubmit,
  onClear,
  isEdit,
}: ReportSectionFormProps) {
  const { isLoading: isReportsLoading, data: reports } = useQuery({
    queryFn: getAllReports,
    queryKey: ["all-reports"],
    staleTime: 120000,
  });

  // Default data has empty strings for select, this should be populated with proper ids
  useEffect(() => {
    if (
      formData.reportId === "" &&
      !isReportsLoading &&
      reports?.report != null
    ) {
      setFormData((prevState) => ({
        ...prevState,
        reportId: reports?.report[0].id || "",
      }));
    }
  }, [isReportsLoading, formData]);

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="max-w-xl space-y-2"
    >
      <div>
        <Label htmlFor="name">Report Section Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          placeholder="e.g. Current Assets"
          value={formData.name}
          onChange={(e) =>
            setFormData((prevState) => ({ ...prevState, name: e.target.value }))
          }
        />
      </div>
      <div>
        <Label htmlFor="report">Select report</Label>
        <Select
          id="report"
          name="report"
          value={formData.reportId}
          required
          onChange={(e) =>
            setFormData((prevState) => ({
              ...prevState,
              reportId: e.target.value,
            }))
          }
        >
          {reports?.report.map((report) => (
            <SelectOption key={report.id} value={report.id}>
              {report.name}
            </SelectOption>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="order">Set Order</Label>
        <Input
          type="number"
          id="order"
          name="order"
          value={formData.orderIndex}
          required
          min={0}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              orderIndex: e.target.value === "" ? "" : Number(e.target.value),
            }))
          }
        />
      </div>
      <div className="space-x-2 flex justify-end">
        <Button type="submit" variant="default">
          {isEdit ? "Save Changes" : "Add Report"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}
