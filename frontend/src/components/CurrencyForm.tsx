import Button from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";
import type { CurrencyFormData } from "../types/currency";
import type { Dispatch, SetStateAction } from "react";

interface CurrencyFormProps {
  formData: CurrencyFormData;
  setFormData: Dispatch<SetStateAction<CurrencyFormData>>;
  onSubmit: () => void;
  onClear: () => void;
  isEdit: boolean;
}

export default function CurrencyForm({
  formData,
  setFormData,
  onSubmit,
  onClear,
  isEdit,
}: CurrencyFormProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="max-w-xl space-y-2"
    >
      <div>
        <div>
          <Label htmlFor="code">Code</Label>
          <Input
            type="text"
            id="code"
            name="code"
            required
            placeholder="e.g. EUR, USD"
            minLength={3}
            maxLength={3}
            value={formData.code}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                code: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <Label htmlFor="name">Name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            required
            placeholder="e.g. United States Dollar"
            value={formData.name}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                name: e.target.value,
              }))
            }
          />
        </div>
        <div>
          <Label htmlFor="decimals">Decimals</Label>
          <Input
            type="number"
            id="decimals"
            name="decimals"
            required
            placeholder="e.g. 2"
            min={0}
            max={8}
            value={formData.decimals}
            onChange={(e) =>
              setFormData((prevState) => ({
                ...prevState,
                decimals: Number(e.target.value),
              }))
            }
          />
        </div>
      </div>
      <div className="space-x-2 flex justify-end">
        <Button type="submit" variant="default">
          {isEdit ? "Save Changes" : "Add Currency"}
        </Button>
        <Button type="button" variant="secondary" onClick={onClear}>
          Clear
        </Button>
      </div>
    </form>
  );
}
