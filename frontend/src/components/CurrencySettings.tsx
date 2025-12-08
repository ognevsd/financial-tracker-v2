import CurrencyForm from "../components/CurrencyForm";
import CurrencyTable from "../components/CurrencyTable";
import { useState } from "react";
import Toast from "../components/Toast";
import { type CurrencyFormData } from "../types/currency";
import Modal from "../components/Modal";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addCurrency,
  deleteCurrencyById,
  getCurrencyById,
  updateCurrencyById,
} from "../api/currency";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useEscModalClose } from "../hooks/useEscModalClose";
import type { ToastData } from "../types/toast";

const defaultFormData: CurrencyFormData = {
  code: "",
  name: "",
  decimals: 2,
};

const defaultToastData: ToastData = {
  show: false,
  message: "",
  type: "standard",
};

export default function CurrencySettings() {
  const [formData, setFormData] = useState<CurrencyFormData>(defaultFormData);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editCurrencyId, setEditCurrencyId] = useState<string | null>(null);
  const [toastInfo, setToastInfo] = useState<ToastData>(defaultToastData);

  const queryClient = useQueryClient();
  const hideToast = () => setToastInfo(defaultToastData);

  const clearForm = () => setFormData(defaultFormData);
  const onModalClose = () => {
    setShowModal(false);
    setEditCurrencyId(null);
    clearForm();
  };

  useLockBodyScroll(showModal);
  useEscModalClose(showModal, onModalClose);

  const fetchCurrency = useMutation({
    mutationFn: (id: string) => getCurrencyById(id),
    onSuccess: (data) => {
      setFormData(data.currency);
    },
    onError: (error) => {
      setToastInfo({
        show: true,
        message: error.message,
        type: "error",
      });
    },
  });

  const addCurrencyMutation = useMutation({
    mutationFn: () =>
      addCurrency(formData.code, formData.name, formData.decimals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-currencies"] });
      setToastInfo({
        show: true,
        message: `Currency ${formData.code} added successfully`,
        type: "success",
      });
      setFormData(defaultFormData);
    },
    onError: (error) => {
      setToastInfo({
        show: true,
        message: error.message,
        type: "error",
      });
    },
  });

  const updateCurrencyMutation = useMutation({
    mutationFn: (id: string) =>
      updateCurrencyById(id, formData.code, formData.name, formData.decimals),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-currencies"] });
      setToastInfo({
        show: true,
        message: `Currency ${formData.code} updated successfully`,
        type: "success",
      });
      setEditCurrencyId(null);
      setFormData(defaultFormData);
    },
    onError: (error) => {
      setToastInfo({
        show: true,
        message: error.message,
        type: "error",
      });
    },
  });

  const deleteCurrencyMutation = useMutation({
    mutationFn: (id: string) => deleteCurrencyById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-currencies"] });
      setToastInfo({
        show: true,
        message: "Currency deleted successfully",
        type: "success",
      });
    },
    onError: (error) => {
      setToastInfo({
        show: true,
        message: error.message,
        type: "error",
      });
    },
  });

  function editCurrency(id: string) {
    setEditCurrencyId(id);
    fetchCurrency.mutate(id);
    setShowModal(true);
  }

  function submitCurrencyForm() {
    if (editCurrencyId === null) {
      addCurrencyMutation.mutate();
    } else {
      updateCurrencyMutation.mutate(editCurrencyId);
    }
    setShowModal(false);
  }

  return (
    <div className="space-y-2">
      <CurrencyForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={submitCurrencyForm}
        onClear={clearForm}
        isEdit={false}
      />
      <CurrencyTable
        onEdit={editCurrency}
        onDelete={deleteCurrencyMutation.mutate}
      />
      <Modal isOpen={showModal} onClose={onModalClose}>
        <h2>Edit Currency</h2>
        <CurrencyForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={submitCurrencyForm}
          onClear={clearForm}
          isEdit={true}
        />
      </Modal>
      <Toast
        message={toastInfo.message}
        type={toastInfo.type}
        show={toastInfo.show}
        onClose={hideToast}
      />
    </div>
  );
}
