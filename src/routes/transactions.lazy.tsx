import { createLazyFileRoute } from "@tanstack/react-router";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import { useState } from "react";
import Modal from "../components/Modal";

export const Route = createLazyFileRoute("/transactions")({
  component: RouteComponent,
});

const defaultForm = {
  operation: "buy",
  ticker: "",
  date: "",
  type: "",
  quantity: "",
  price: "",
  currency: "",
  note: "",
};

function RouteComponent() {
  const [isModalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState(defaultForm);

  function editTransaction() {}

  function submitForm() {
    console.log(formData);
  }

  return (
    <div className="space-y-4">
      <TransactionForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={submitForm}
      />
      <TransactionTable onEdit={editTransaction} />
      <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
        <h2>Edit Transaction</h2>
      </Modal>
    </div>
  );
}
