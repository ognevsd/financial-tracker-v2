import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

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
          <div>
            <label htmlFor="operation" className="block font-semibold mb-1">
              Operation
            </label>
            <select
              name="operation"
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
            <input
              type="date"
              name="date"
              className="border rounded px-2 py-1 w-full"
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
              name="ticker"
              className="border rounded px-2 py-1 w-full"
              value={formData.ticker}
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
            <select
              name="type"
              className="border rounded px-2 py-1 w-full"
              value={formData.type}
              required
              onChange={(e) => {
                setFormData((prevState) => ({
                  ...prevState,
                  type: e.target.value,
                }));
              }}
            >
              <option value="share">Share</option>
              <option value="option">Option</option>
            </select>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
