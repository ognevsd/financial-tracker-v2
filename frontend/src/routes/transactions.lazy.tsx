import { createLazyFileRoute } from "@tanstack/react-router";
import TransactionForm from "../components/TransactionForm";
import TransactionTable from "../components/TransactionTable";
import { useState } from "react";
import Modal from "../components/Modal";

import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useEscModalClose } from "../hooks/useEscModalClose";
import type { TransactionFormData } from "../types/transaction";
import { type ToastData } from "../types/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "../components/Toast";
import {
  addTransaction,
  deleteTransaction,
  getTransactionById,
  updateTransaction,
} from "../api/transaction";
import { Card } from "../components/ui/card";

export const Route = createLazyFileRoute("/transactions")({
  component: RouteComponent,
});

const defaultForm: TransactionFormData = {
  operation: "",
  date: new Date().toISOString().split("T")[0],
  ticker: "",
  type: "",
  quantity: "",
  price: "",
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

  const getTransactionByIdMutation = useMutation({
    mutationFn: (id: string) => getTransactionById(id),
    onSuccess: (data) => {
      setFormData(data.transaction);
    },
    onError: (error) => {
      setToastInfo({
        show: true,
        message: error.message,
        type: "error",
      });
    },
  });

  const updateTransactionMutation = useMutation({
    mutationFn: (id: string) => updateTransaction(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-transactions"] });
      setToastInfo({
        show: true,
        message: "Transaction updated successfully",
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

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-transactions"] });
      setToastInfo({
        show: true,
        message: "Transaction deleted successfully",
        type: "success",
      });
      setEditTransactionId(null);
      setFormData(defaultForm);
      setModalOpen(false);
    },
    onError: (error) => {
      setToastInfo({
        show: true,
        message: error.message,
        type: "error",
      });
    },
  });

  const onTransactionEdit = (id: string) => {
    setEditTransactionId(id);
    getTransactionByIdMutation.mutate(id);
    setModalOpen(true);
  };

  function submitForm() {
    if (editTransactionId !== null) {
      updateTransactionMutation.mutate(editTransactionId);
    } else {
      addTransactionMutation.mutate();
    }
    setModalOpen(false);
  }

  useLockBodyScroll(isModalOpen);
  useEscModalClose(isModalOpen, onModalClose);

  return (
    <div className="space-y-4">
      <Card>
        <TransactionForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={submitForm}
          onClear={clearForm}
          isEdit={false}
        />
      </Card>
      <TransactionTable
        onEdit={onTransactionEdit}
        onDelete={deleteTransactionMutation.mutate}
      />
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
          onDelete={deleteTransactionMutation.mutate}
        />
      </Modal>
    </div>
  );
}
