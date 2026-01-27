import { formatCurrency } from "../lib/reportUtils";
import type { EditValue } from "../types/report";
import { Input } from "./ui/input";

export default function ValueCell({
  isFinancial,
  isEditing,
  value,
  onChangeValue,
}: {
  isFinancial: boolean;
  isEditing: boolean;
  value: EditValue;
  onChangeValue: (v: EditValue) => void;
}) {
  if (!isEditing) {
    const n = value === "" ? 0 : value;
    return (
      <span className="tabular-nums">
        {isFinancial ? formatCurrency(n) : n}
      </span>
    );
  }

  return (
    <Input
      name="reportInput"
      type="number"
      inputMode="decimal"
      value={value === "" ? "" : Number(value)}
      onChange={(e) => {
        onChangeValue(e.target.value === "" ? "" : Number(e.target.value));
      }}
    />
  );
}
