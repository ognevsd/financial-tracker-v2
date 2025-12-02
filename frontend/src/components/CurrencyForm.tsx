import { useMutation } from "@tanstack/react-query";
import { addCurrency } from "../api/currency";
import Button from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "@radix-ui/react-label";

export default function CurrencyForm() {
  const mutation = useMutation({
    mutationFn: function (e) {
      e.preventDefault();
      const formData = new FormData(e.target);
      return addCurrency(
        formData.get("code"),
        formData.get("name"),
        formData.get("decimals"),
      );
    },
  });

  return (
    <form onSubmit={mutation.mutate}>
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
        />
      </div>
      <div>
        <label htmlFor="name" className="block">
          Name
        </label>
        <input
          className="border rounded px-2 py-1 min-w-sm"
          type="text"
          id="name"
          name="name"
          required
          placeholder="e.g. United States Dollar"
        />
      </div>
      <div>
        <label htmlFor="decimals" className="block">
          Decimals
        </label>
        <input
          className="border rounded px-2 py-1 min-w-sm"
          type="number"
          id="decimals"
          name="decimals"
          required
          placeholder="e.g. 2"
          min={0}
          max={8}
        />
      </div>
      <Button type="button" variant="default">
        Add Currency
      </Button>
    </form>
  );
}
