import { createLazyFileRoute } from "@tanstack/react-router";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import { useEffect, useMemo, useState } from "react";
import Modal from "../components/Modal";

import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useEscModalClose } from "../hooks/useEscModalClose";
import type { TransactionFormData } from "../types/transaction";
import { type ToastData } from "../types/toast";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Toast from "../components/Toast";
import { getAllCurrencies } from "../api/currency";
import { addTransaction } from "../api/transaction";

export const Route = createLazyFileRoute("/transactions")({
  component: RouteComponent,
});

const defaultForm: TransactionFormData = {
  operation: "",
  date: new Date().toISOString().split("T")[0],
  ticker: "",
  type: "",
  quantity: 0,
  price: 0,
  currency: "",
  note: "",
};

const defaultToastData: ToastData = {
  show: false,
  type: "standard",
  message: "",
};

function RouteComponent() {
  const [formData, setFormData] = useState<TransactionFormData>(defaultForm);
  const [isModalOpen, setModalOpen] = useState<boolean>(false);
  const [editTransactionId, setEditTransactionId] = useState<string | null>(
    null,
  );
  const [toastInfo, setToastInfo] = useState<ToastData>(defaultToastData);

  const queryClient = useQueryClient();
  const onToastClose = () => setToastInfo(defaultToastData);
  const clearForm = () => setFormData(defaultForm);
  const onModalClose = () => {
    setModalOpen(false);
    setEditTransactionId(null);
    clearForm();
  };

  const { data: currencies, isPending: isCurrenciesPending } = useQuery({
    queryFn: getAllCurrencies,
    queryKey: ["all-currencies"],
    staleTime: 120_000,
  });

  const addTransactionMutation = useMutation({
    mutationFn: () => addTransaction(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-transactions"] });
      setToastInfo({
        show: true,
        message: "Transaction added successfully",
        type: "success",
      });
      setEditTransactionId(null);
      setFormData(defaultForm);
    },
    onError: (error) => {
      setToastInfo({
        show: true,
        message: error.message,
        type: "error",
      });
    },
  });

  function submitForm() {
    console.log(formData);
    if (editTransactionId !== null) {
      updateTransaction();
      console.log("Yo");
    } else {
      addTransactionMutation.mutate();
    }
    // clearForm();
  }

  useLockBodyScroll(isModalOpen);
  useEscModalClose(isModalOpen, () => setModalOpen(false));

  return (
    <div className="space-y-4">
      <TransactionForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={submitForm}
        onClear={clearForm}
        isEdit={false}
      />
      <TransactionTable />
      <Toast
        show={toastInfo.show}
        type={toastInfo.type}
        message={toastInfo.message}
        onClose={onToastClose}
      />
      <Modal isOpen={isModalOpen} onClose={onModalClose}>
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
