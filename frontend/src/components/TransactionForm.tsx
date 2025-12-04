import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Select, SelectOption } from "./ui/select";

export default function TransactionForm({
  formData,
  setFormData,
  onSubmit,
  onClear,
  isEdit,
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>New Transaction</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div>
              <label htmlFor="operation" className="block font-semibold mb-1">
                Operation
              </label>
              <select
                id="operation"
                className="border rounded px-2 py-1 w-full"
                value={formData.operation}
                required
                onChange={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    operation: e.target.value,
                  }));
                }}
              >
                <option value="buy">Buy</option>
                <option value="sell">Sell</option>
                <option value="dividend">Dividend</option>
              </select>
            </div>
            <div>
              <label htmlFor="date" className="block font-semibold mb-1">
                Date
              </label>
              <Input
                type="date"
                id="date"
                // className="border rounded px-2 py-1 w-full"
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
              <label htmlFor="ticker" className="block font-semibold mb-1">
                Ticker
              </label>
              <input
                type="text"
                id="ticker"
                className="border rounded px-2 py-1 w-full"
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
              <label htmlFor="type" className="block font-semibold mb-1">
                Type
              </label>
              <Select
                id="type"
                className="w-full"
                value={formData.type}
                required
                onChange={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    type: e.target.value,
                  }));
                }}
              >
                <SelectOption value="share">Share</SelectOption>
                <SelectOption value="option">Option</SelectOption>
              </Select>
            </div>
            <div>
              <label htmlFor="quantity" className="block font-semibold mb-1">
                Quantity
              </label>
              <input
                type="number"
                id="quantity"
                min={0}
                className="border rounded px-2 py-1 w-full"
                value={formData.quantity}
                required
                onChange={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    quantity: e.target.value,
                  }));
                }}
              />
            </div>
            <div>
              <label htmlFor="price" className="block font-semibold mb-1">
                {formData.operation === "dividend"
                  ? "Dividend Amount"
                  : "Price"}
              </label>
              <input
                type="number"
                id="price"
                min={0}
                step="any"
                className="border rounded px-2 py-1 w-full"
                value={formData.price}
                required
                onChange={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    price: e.target.value,
                  }));
                }}
              />
            </div>
            <div>
              <label htmlFor="total" className="block font-semibold mb-1">
                Total Amount
              </label>
              <input
                type="number"
                id="total"
                className="border rounded px-2 py-1 w-full"
                value={(formData.price * formData.quantity).toFixed(2)}
                disabled
              />
            </div>
            <div>
              <label htmlFor="currency" className="block font-semibold mb-1">
                Currency
              </label>
              <select
                id="currency"
                className="border rounded px-2 py-1 w-full"
                value={formData.currency}
                onChange={(e) => {
                  setFormData((prevState) => ({
                    ...prevState,
                    currency: e.target.value,
                  }));
                }}
              >
                <option value="eur">EUR</option>
                <option value="usd">USD</option>
                <option value="gbp">GBP</option>
                <option value="hkd">HKD</option>
              </select>
            </div>
          </div>
          <div>
            <label htmlFor="note" className="block font-semibold mb-1">
              Note
            </label>
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
            <button
              type="submit"
              className="border px-4 py-2 rounded hover:bg-gray-200"
            >
              {isEdit ? "Save Changes" : "Add Transaction"}
            </button>
            <button
              type="button"
              className="border px-4 py-2 rounded hover:bg-gray-200"
              onClick={onClear}
            >
              Clear
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
