import type { Dispatch, SetStateAction } from "react";
import type { OperationFormData } from "../types/operations";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import Button from "./ui/button";

interface OperationFormProps {
  formData: OperationFormData;
  setFormData: Dispatch<SetStateAction<OperationFormData>>;
  onSubmit: () => void;
  onClear: () => void;
  isEdit: boolean;
}

export default function OperationForm({
  formData,
  setFormData,
  onSubmit,
  onClear,
  isEdit,
}: OperationFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="max-w-xl space-y-2"
    >
      <div>
        <Label htmlFor="name">Operation Name</Label>
        <Input
          type="text"
          id="name"
          name="name"
          required
          placeholder="e.g. BUY, SELL"
          value={formData.name}
          onChange={(e) =>
            setFormData((prevState) => ({ ...prevState, name: e.target.value }))
          }
        />
      </div>
      <div className="space-x-2 flex justify-end">
        <Button type="submit" variant="default">
          {isEdit ? "Save Changes" : "Add Operation"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}
