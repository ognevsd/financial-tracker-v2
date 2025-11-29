// App.jsx
import React, { useState, useEffect } from "react";
import Papa from "papaparse";

const defaultForm = {
  date: "",
  type: "buy",
  symbol: "",
  shares: "",
  price: "",
  dividend: "",
};

function TransactionForm({ formData, setFormData, onSubmit, onClear, isEdit }) {
  return (
    <form
      className="bg-white p-4 rounded shadow-md space-y-4 w-full max-w-md"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
    >
      <div>
        <label className="block font-semibold mb-1">Date</label>
        <input
          type="date"
          className="border rounded px-2 py-1 w-full"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          required
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Type</label>
        <select
          className="border rounded px-2 py-1 w-full"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
        >
          <option value="buy">Buy</option>
          <option value="sell">Sell</option>
          <option value="dividend">Dividend</option>
        </select>
      </div>
      <div>
        <label className="block font-semibold mb-1">Symbol</label>
        <input
          type="text"
          className="border rounded px-2 py-1 w-full"
          value={formData.symbol}
          onChange={(e) =>
            setFormData({ ...formData, symbol: e.target.value.toUpperCase() })
          }
          required={formData.type !== "dividend"}
          disabled={formData.type === "dividend"}
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">Shares</label>
        <input
          type="number"
          step="any"
          className="border rounded px-2 py-1 w-full"
          value={formData.shares}
          onChange={(e) => setFormData({ ...formData, shares: e.target.value })}
          required={formData.type !== "dividend"}
          disabled={formData.type === "dividend"}
          min="0"
        />
      </div>
      <div>
        <label className="block font-semibold mb-1">
          {formData.type === "dividend" ? "Dividend Amount" : "Price"}
        </label>
        <input
          type="number"
          step="any"
          className="border rounded px-2 py-1 w-full"
          value={
            formData.type === "dividend" ? formData.dividend : formData.price
          }
          onChange={(e) => {
            if (formData.type === "dividend") {
              setFormData({ ...formData, dividend: e.target.value });
            } else {
              setFormData({ ...formData, price: e.target.value });
            }
          }}
          required
          min="0"
        />
      </div>
      <div className="flex space-x-4">
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isEdit ? "Save Changes" : "Add Transaction"}
        </button>
        <button
          type="button"
          className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          onClick={onClear}
        >
          Clear
        </button>
      </div>
    </form>
  );
}

function TransactionTable({ data, onEdit, onDelete }) {
  return (
    <table className="min-w-full bg-white shadow rounded overflow-hidden">
      <thead className="bg-gray-200 text-left">
        <tr>
          <th className="py-2 px-4">Date</th>
          <th className="py-2 px-4">Type</th>
          <th className="py-2 px-4">Symbol</th>
          <th className="py-2 px-4">Shares</th>
          <th className="py-2 px-4">Price</th>
          <th className="py-2 px-4">Dividend</th>
          <th className="py-2 px-4">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((tx, i) => (
          <tr key={i} className={i % 2 === 0 ? "bg-gray-50" : "bg-white"}>
            <td className="py-2 px-4">{tx.date}</td>
            <td className="py-2 px-4 capitalize">{tx.type}</td>
            <td className="py-2 px-4">{tx.symbol}</td>
            <td className="py-2 px-4">{tx.shares}</td>
            <td className="py-2 px-4">{tx.price}</td>
            <td className="py-2 px-4">{tx.dividend}</td>
            <td className="py-2 px-4 space-x-2">
              <button
                className="bg-yellow-400 px-2 py-1 rounded hover:bg-yellow-500 text-white"
                onClick={() => onEdit(i)}
              >
                Edit
              </button>
              <button
                className="bg-red-600 px-2 py-1 rounded hover:bg-red-700 text-white"
                onClick={() => onDelete(i)}
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan="7" className="text-center py-4 text-gray-500">
              No transactions available
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
}

function Modal({ isOpen, onClose, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded p-6 max-w-lg w-full relative shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-600 hover:text-gray-900 text-xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        {children}
      </div>
    </div>
  );
}

function FileInput({ onFileLoad }) {
  // Used for CSV file input and parsing with PapaParse
  return (
    <div className="mb-4">
      <input
        type="file"
        accept=".csv,text/csv"
        onChange={(e) => {
          if (e.target.files.length > 0) {
            const file = e.target.files[0];
            Papa.parse(file, {
              header: true,
              skipEmptyLines: true,
              complete: (results) => {
                onFileLoad(results.data);
              },
              error: (err) => alert("Error reading CSV: " + err.message),
            });
          }
        }}
        className="border p-1 rounded"
      />
    </div>
  );
}

function downloadCSV(data) {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "transactions.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState(defaultForm);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [autoSave, setAutoSave] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // On transaction changes, if autoSave is on, export CSV immediately
  useEffect(() => {
    if (autoSave) {
      downloadCSV(transactions);
      setHasUnsavedChanges(false);
    } else {
      if (transactions.length > 0) setHasUnsavedChanges(true);
    }
  }, [transactions, autoSave]);

  const resetForm = () => setFormData(defaultForm);

  const addTransaction = () => {
    setTransactions([...transactions, formData]);
    resetForm();
  };

  const updateTransaction = () => {
    const updated = [...transactions];
    updated[editingIndex] = formData;
    setTransactions(updated);
    setEditingIndex(null);
    setIsModalOpen(false);
    resetForm();
  };

  const onSubmit = () => {
    if (editingIndex !== null) {
      updateTransaction();
    } else {
      addTransaction();
    }
  };

  const startEdit = (index) => {
    setFormData(transactions[index]);
    setEditingIndex(index);
    setIsModalOpen(true);
  };

  const deleteTransaction = (index) => {
    const filtered = transactions.filter((_, i) => i !== index);
    setTransactions(filtered);
  };

  const onFileLoad = (data) => {
    // Normalize data for missing fields (shares, price, dividend may be empty strings)
    const norm = data.map((tx) => ({
      date: tx.date || "",
      type: tx.type || "buy",
      symbol: tx.symbol || "",
      shares: tx.shares || "",
      price: tx.price || "",
      dividend: tx.dividend || "",
    }));
    setTransactions(norm);
    setHasUnsavedChanges(false);
  };

  const saveCSV = () => {
    downloadCSV(transactions);
    setHasUnsavedChanges(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Transaction Manager</h1>

      <FileInput onFileLoad={onFileLoad} />

      <div className="mb-4 flex items-center space-x-6">
        <label className="flex items-center space-x-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={autoSave}
            onChange={(e) => setAutoSave(e.target.checked)}
          />
          <span>Auto-save CSV on every change</span>
        </label>
        <button
          onClick={saveCSV}
          disabled={!hasUnsavedChanges}
          className={`px-4 py-2 rounded ${
            hasUnsavedChanges
              ? "bg-green-600 text-white hover:bg-green-700 cursor-pointer"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
        >
          Save CSV Now
        </button>
        {hasUnsavedChanges && !autoSave && (
          <span className="text-red-600 font-semibold">Unsaved changes</span>
        )}
      </div>

      <TransactionForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={onSubmit}
        onClear={resetForm}
        isEdit={false}
      />

      <div className="my-6">
        <TransactionTable
          data={transactions}
          onEdit={startEdit}
          onDelete={deleteTransaction}
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <h2 className="text-xl font-bold mb-4">Edit Transaction</h2>
        <TransactionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={onSubmit}
          onClear={() => {
            resetForm();
            setIsModalOpen(false);
            setEditingIndex(null);
          }}
          isEdit={true}
        />
      </Modal>
    </div>
  );
}
