import { useQuery } from "@tanstack/react-query";
import { Input } from "./ui/input";
import { Select, SelectOption } from "./ui/select";
import { getAllCurrencies } from "../api/currency";
import { getAllOperations } from "../api/operations";
import { Label } from "./ui/label";
import { getAllAssetTypes } from "../api/assetType";
import Button from "./ui/button";
import type { TransactionFormData } from "../types/transaction";
import { useEffect, type Dispatch, type SetStateAction } from "react";

interface TransactionFormProps {
  formData: TransactionFormData;
  setFormData: Dispatch<SetStateAction<TransactionFormData>>;
  onSubmit: () => void;
  onClear: () => void;
  isEdit: boolean;
}

export default function TransactionForm({
  formData,
  setFormData,
  onSubmit,
  onClear,
  isEdit,
}: TransactionFormProps) {
  const { data: currencies, isPending: isCurrenciesPending } = useQuery({
    queryFn: getAllCurrencies,
    queryKey: ["all-currencies"],
    staleTime: 120_000,
  });

  const { data: operations, isPending: isOperationsPending } = useQuery({
    queryFn: getAllOperations,
    queryKey: ["all-operations"],
    staleTime: 120_000,
  });

  const { data: assetTypes, isPending: isAssetTypePeding } = useQuery({
    queryFn: getAllAssetTypes,
    queryKey: ["all-asset-types"],
    staleTime: 120_000,
  });

  // Default data has empty strings for select, this should be populated with proper ids
  useEffect(() => {
    if (
      formData.currency === "" &&
      !isCurrenciesPending &&
      currencies !== null
    ) {
      setFormData((prevState) => ({
        ...prevState,
        currency: currencies?.[0].id || "",
      }));
    }
    if (
      formData.operation === "" &&
      !isOperationsPending &&
      operations?.operation !== null
    ) {
      setFormData((prevState) => ({
        ...prevState,
        operation: operations?.operation[0].id || "",
      }));
    }
    if (
      formData.operation === "" &&
      !isAssetTypePeding &&
      assetTypes?.assetType != null
    ) {
      setFormData((prevState) => ({
        ...prevState,
        type: assetTypes?.assetType[0].id || "",
      }));
    }
  }, [isCurrenciesPending, isOperationsPending, isAssetTypePeding, formData]);

  if (isCurrenciesPending || isOperationsPending || isAssetTypePeding) {
    return <div>Loading...</div>;
  }

  if (
    currencies === null ||
    operations?.operation === null ||
    assetTypes?.assetType === null
  ) {
    return <div>Currency, operation or asset type settings are missing</div>;
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="py-2"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
        <div>
          <Label htmlFor="operation">Operation</Label>
          <Select
            id="operation"
            name="operation"
            value={formData.operation}
            required
            onChange={(e) => {
              setFormData((prevState) => ({
                ...prevState,
                operation: e.target.value,
              }));
            }}
          >
            {operations?.operation.map((op) => (
              <SelectOption key={op.id} value={op.id}>
                {op.name}
              </SelectOption>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            type="text"
            id="date"
            pattern="\d{4}-\d{2}-\d{2}"
            value={formData.date}
            required
            onChange={(e) => {
              setFormData((prevState) => ({
                ...prevState,
                date: e.target.value,
              }));
            }}
          />
        </div>
        <div>
          <Label htmlFor="ticker">Ticker</Label>
          <Input
            type="text"
            id="ticker"
            value={formData.ticker}
            placeholder="e.g., AAPL"
            required
            onChange={(e) => {
              setFormData((prevState) => ({
                ...prevState,
                ticker: e.target.value,
              }));
            }}
          />
        </div>
        <div>
          <Label htmlFor="type">Type</Label>
          <Select
            id="type"
            value={formData.type}
            required
            onChange={(e) => {
              setFormData((prevState) => ({
                ...prevState,
                type: e.target.value,
              }));
            }}
          >
            {assetTypes?.assetType.map((type) => (
              <SelectOption key={type.id} value={type.id}>
                {type.name}
              </SelectOption>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            type="number"
            id="quantity"
            min={0}
            value={formData.quantity}
            required
            onChange={(e) => {
              setFormData((prevState) => ({
                ...prevState,
                quantity: e.target.value === "" ? "" : Number(e.target.value),
              }));
            }}
          />
        </div>
        <div>
          <Label htmlFor="price">
            {formData.operation ===
            operations?.operation.find((item) => item.name === "DIVIDEND")?.id
              ? "Dividend Amount"
              : "Price"}
          </Label>
          <Input
            type="number"
            id="price"
            min={0}
            step="any"
            value={formData.price}
            required
            onChange={(e) => {
              setFormData((prevState) => ({
                ...prevState,
                price: e.target.value === "" ? "" : Number(e.target.value),
              }));
            }}
          />
        </div>
        <div>
          <Label htmlFor="total">Total Amount</Label>
          <Input
            type="number"
            id="total"
            value={
              assetTypes?.assetType.find((item) => item.id === formData.type)
                ?.name === "Option"
                ? (
                    Number(formData.price) *
                    Number(formData.quantity) *
                    100
                  ).toFixed(2)
                : (Number(formData.price) * Number(formData.quantity)).toFixed(
                    2,
                  )
            }
            disabled
          />
        </div>
        <div>
          <Label htmlFor="currency">Currency</Label>
          <Select
            id="currency"
            value={formData.currency}
            onChange={(e) => {
              setFormData((prevState) => ({
                ...prevState,
                currency: e.target.value,
              }));
            }}
          >
            {currencies?.map((currency) => (
              <SelectOption key={currency.id} value={currency.id}>
                {currency.code}
              </SelectOption>
            ))}
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="note">Note</Label>
        <textarea
          id="note"
          className="border rounded px-2 py-1 w-full"
          value={formData.note}
          onChange={(e) => {
            setFormData((prevState) => ({
              ...prevState,
              note: e.target.value,
            }));
          }}
        />
      </div>
      <div className="space-x-2">
        <Button
          type="submit"
          className="border px-4 py-2 rounded hover:bg-gray-200"
        >
          {isEdit ? "Save Changes" : "Add Transaction"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="border px-4 py-2 rounded hover:bg-gray-200"
          onClick={onClear}
        >
          Clear
        </Button>
      </div>
    </form>
  );
}
