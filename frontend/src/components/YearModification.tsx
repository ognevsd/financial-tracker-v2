import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { getYears, upsertYear } from "../api/reportField";
import Loading from "./Loading";
import { Input } from "./ui/input";
import Button from "./ui/button";
import { PlusIcon, Trash2 } from "lucide-react";

export function YearModification({
  companyId,
  reportId,
}: {
  companyId: string;
  reportId: string;
}) {
  const [years, setYears] = useState<number[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryFn: () => getYears(companyId, reportId),
    queryKey: [companyId, reportId, "years"],
    staleTime: 120_000,
  });

  const upsertYearMiutation = useMutation({
    mutationFn: ({
      year,
      prevYearValue,
    }: {
      year: number;
      prevYearValue: number | null;
    }) => upsertYear(year, prevYearValue, reportId, companyId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [companyId, reportId, "years"],
      });
    },
  });

  useEffect(() => {
    if (data?.years) {
      setYears(data.years);
    }
  }, [data?.years]);

  // =========================================================================
  if (isLoading) {
    return <Loading />;
  }

  const onYearAdd = () => {
    setYears((prev) => [...prev, ""]);
  };

  const onYearDelete = (index: number) => {
    setYears((prev) => prev.filter((_, i) => i !== index));
  };

  const onYearChange = (index: number, newValue: number) => {
    setYears((prev) => {
      const newYears = [...prev];
      newYears[index] = newValue;
      return newYears;
    });
  };

  const handleOnBlur = (year: number) => {
    if (year === 0) return;
    if (year === selectedYear) return;
    upsertYearMiutation.mutate({ year: year, prevYearValue: selectedYear });
    setYears((prev) => [...prev].sort((a, b) => Number(b) - Number(a)));
    setSelectedYear(null);
  };

  const handleOnFocus = (year: number | "") => {
    if (!(year === "")) {
      setSelectedYear(year);
    }
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
                onBlur={(e) => handleOnBlur(Number(e.target.value))}
                pattern="\d{4}"
                onChange={(e) => onYearChange(index, Number(e.target.value))}
                onFocus={() => handleOnFocus(year)}
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
