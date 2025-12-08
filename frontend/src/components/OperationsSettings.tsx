import OperationForm from "../components/OperationsForm";
import type { OperationFormData } from "../types/operations";
import { useState } from "react";
import OperationsTable from "../components/OperationsTable";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addOperation,
  DeleteOperationById,
  getOperationById,
  updateOperationById,
} from "../api/operations";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useEscModalClose } from "../hooks/useEscModalClose";
import type { ToastType } from "../types/toast";

interface ToastData {
  show: boolean;
  message: string;
  type: ToastType;
}
const defaultFormData: OperationFormData = {
  id: "",
  name: "",
};
const defaultToastData: ToastData = {
  show: false,
  message: "",
  type: "standard",
};

export default function OperationsSettings() {
  const [formData, setFormData] = useState<OperationFormData>(defaultFormData);
  const [toastData, setToastData] = useState<ToastData>(defaultToastData);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editOperationId, setEditOperationId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const clearForm = () => setFormData(defaultFormData);
  const onToastClose = () => setToastData(defaultToastData);
  const onModalClose = () => {
    setShowModal(false);
    setEditOperationId(null);
    setFormData(defaultFormData);
  };

  useLockBodyScroll(showModal);
  useEscModalClose(showModal, onModalClose);

  const addOperationMutation = useMutation({
    mutationFn: () => addOperation(formData.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-operations"] });
      setToastData({
        show: true,
        message: `Operation ${formData.name} added successfully`,
        type: "success",
      });
      setFormData(defaultFormData);
    },
    onError: (e) => {
      setToastData({
        show: true,
        message: e.message,
        type: "error",
      });
    },
  });

  const fetchOperationMutation = useMutation({
    mutationFn: (id: string) => getOperationById(id),
    onSuccess: (data) => {
      setFormData(data.operation);
    },
    onError: (e) => {
      setToastData({
        show: true,
        message: e.message,
        type: "error",
      });
    },
  });

  const editOperationMutation = useMutation({
    mutationFn: (id: string) => updateOperationById(id, formData.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-operations"] });
      setToastData({
        show: true,
        message: `Operation ${formData.name} updated`,
        type: "success",
      });
      setEditOperationId(null);
      setFormData(defaultFormData);
    },
    onError: (e) => {
      setToastData({
        show: true,
        message: e.message,
        type: "error",
      });
    },
  });

  const deleteOperationMutation = useMutation({
    mutationFn: (id: string) => DeleteOperationById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-operations"] });
      setToastData({
        show: true,
        message: "Operation deleted successfully",
        type: "success",
      });
    },
    onError: (error) => {
      setToastData({
        show: true,
        message: error.message,
        type: "error",
      });
    },
  });

  const onEditOperation = (id: string) => {
    setEditOperationId(id);
    fetchOperationMutation.mutate(id);
    setShowModal(true);
  };

  const submitOperationForm = () => {
    if (editOperationId == null) {
      addOperationMutation.mutate();
    } else {
      editOperationMutation.mutate(editOperationId);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-2">
      <OperationForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={submitOperationForm}
        onClear={clearForm}
        isEdit={false}
      />
      <OperationsTable
        onEdit={onEditOperation}
        onDelete={deleteOperationMutation.mutate}
      />
      <Toast
        show={toastData.show}
        message={toastData.message}
        type={toastData.type}
        onClose={onToastClose}
      />
      <Modal isOpen={showModal} onClose={onModalClose}>
        <OperationForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={submitOperationForm}
          onClear={clearForm}
          isEdit={true}
        />
      </Modal>
    </div>
  );
}
