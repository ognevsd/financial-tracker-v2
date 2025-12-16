import { useEffect, type Dispatch, type SetStateAction } from "react";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Button from "./ui/button";
import type { TaxonomyFormData } from "../types/taxonomy";
import { getAllReports } from "../api/report";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectOption } from "./ui/select";

interface TaxonomyFormProps {
  formData: TaxonomyFormData;
  setFormData: Dispatch<SetStateAction<TaxonomyFormData>>;
  onSubmit: () => void;
  onClear: () => void;
  isEdit: boolean;
}

export default function TaxonomyForm({
  formData,
  setFormData,
  onSubmit,
  onClear,
  isEdit,
}: TaxonomyFormProps) {
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
        <Label htmlFor="name">Taxonomy Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          placeholder="e.g. Balance Sheet"
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
          {reports?.report === null ? (
            <SelectOption></SelectOption>
          ) : (
            reports?.report.map((report) => (
              <SelectOption key={report.id} value={report.id}>
                {report.name}
              </SelectOption>
            ))
          )}
        </Select>
      </div>
      <div>
        <Label htmlFor="name">Description</Label>
        <Input
          type="text"
          id="description"
          name="description"
          required
          placeholder="e.g. Propery, plant, equipment, Revenue/Sales"
          value={formData.description}
          onChange={(e) =>
            setFormData((prevState) => ({
              ...prevState,
              description: e.target.value,
            }))
          }
        />
      </div>
      <div className="space-x-2 flex justify-end">
        <Button type="submit" variant="default">
          {isEdit ? "Save Changes" : "Add Taxonomy"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}
