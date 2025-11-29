import { createLazyFileRoute } from "@tanstack/react-router";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import { useEffect, useMemo, useState, type Key } from "react";
import Modal from "../components/Modal";

import Papa, { ParseResult } from "papaparse";

export const Route = createLazyFileRoute("/transactions")({
  component: RouteComponent,
});

const OperationEnum = {
  Buy: "Buy",
  Sell: "Sell",
  Dividend: "Dividend",
} as const;

type OperationEnum = (typeof OperationEnum)[keyof typeof OperationEnum];

const CurrencyEnum = {
  USD: "USD",
  EUR: "EUR",
  GBP: "GBP",
} as const;
type CurrencyEnum = (typeof CurrencyEnum)[keyof typeof CurrencyEnum];

interface DataRow {
  operation: OperationEnum;
  ticker: string;
  date: string;
  type: string;
  quantity: number;
  price: number;
  currency: CurrencyEnum;
  note: string;
}

const defaultForm = {
  operation: "buy",
  ticker: "",
  date: "",
  type: "share",
  quantity: "",
  price: "",
  currency: "eur",
  note: "",
};

function RouteComponent() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);
  const [data, setData] = useState<DataRow[]>([]);
  const [editingIndex, setEditingIndex] = useState(null);

  function clearForm() {
    setFormData(defaultForm);
  }

  function addTransaction() {
    setData((prevState) => [...prevState, formData]);
  }
  function updateTransaction() {
    const updated = [...sortedData];
    updated[editingIndex] = formData;
    setData(updated);
    setEditingIndex(null);
    setModalOpen(false);
  }

  function submitForm() {
    if (editingIndex !== null) {
      updateTransaction();
    } else {
      addTransaction();
    }
    clearForm();
  }

  function editTransaction(index: number) {
    setFormData(sortedData[index]);
    setEditingIndex(index);
    setModalOpen(true);
  }

  // Sorting data by time
  const sortedData = useMemo(() => {
    return [...data].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );
  }, [data]);

  useEffect(() => {
    fetch("/trade_journal.csv")
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse<DataRow>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results: ParseResult<DataRow>) => {
            setData(results.data);
          },
          error: (error) => {
            console.error("Error parsing csv:", error);
          },
        });
      })
      .catch((error) => {
        console.error("Error fetching csv:", error);
      });
  }, []);

  // Disabling scroll when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isModalOpen]);

  // Close modal when Esc is clicked
  useEffect(() => {
    const handleEscClick = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setModalOpen(false);
      }
    };
    if (isModalOpen) {
      document.addEventListener("keydown", handleEscClick);
    }

    return () => {
      document.removeEventListener("keydown", handleEscClick);
    };
  }, [isModalOpen]);

  return (
    <div className="space-y-4">
      <TransactionForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={submitForm}
        onClear={clearForm}
        isEdit={false}
      />
      <TransactionTable data={sortedData} onEdit={editTransaction} />
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false);
          clearForm();
        }}
      >
        <h2>Edit Transaction</h2>
        <TransactionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={submitForm}
          onClear={clearForm}
          isEdit={true}
        />
      </Modal>
    </div>
  );
}
