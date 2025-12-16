import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useEscModalClose } from "../hooks/useEscModalClose";
import { defaultToastData, type ToastData } from "../types/toast";
import type { ReportFormData } from "../types/report";
import TaxonomyTable from "./TaxonomyTable";
import TaxonomyForm from "./TaxonomyForm";
import type { TaxonomyFormData } from "../types/taxonomy";
import {
  addTaxonomy,
  deleteTaxonomyById,
  getTaxonomyById,
  updateTaxonomy,
} from "../api/taxonomy";

const defaultFormData: TaxonomyFormData = {
  id: "",
  name: "",
  description: "",
  reportId: "",
};

export default function TaxonomySettings() {
  const [formData, setFormData] = useState<TaxonomyFormData>(defaultFormData);
  const [toastData, setToastData] = useState<ToastData>(defaultToastData);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editTaxonomyId, setEditTaxonomyId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const clearForm = () => setFormData(defaultFormData);
  const onToastClose = () => setToastData(defaultToastData);
  const onModalClose = () => {
    setShowModal(false);
    setEditTaxonomyId(null);
    setFormData(defaultFormData);
  };

  useLockBodyScroll(showModal);
  useEscModalClose(showModal, onModalClose);

  const addTaxonomyMutation = useMutation({
    mutationFn: () => addTaxonomy(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-taxonomies"] });
      setToastData({
        show: true,
        message: `Taxonomy ${formData.name} added successfully`,
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

  const getTaxonomyByIdMutation = useMutation({
    mutationFn: (id: string) => getTaxonomyById(id),
    onSuccess: (data) => {
      setFormData(data.taxonomy);
    },
    onError: (e) => {
      setToastData({
        show: true,
        message: e.message,
        type: "error",
      });
    },
  });

  const editTaxonomyMutation = useMutation({
    mutationFn: (id: string) => updateTaxonomy(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-taxonomies"] });
      setToastData({
        show: true,
        message: `Taxonomy ${formData.name} updated`,
        type: "success",
      });
      setEditTaxonomyId(null);
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

  const deleteTaxonomyMutation = useMutation({
    mutationFn: (id: string) => deleteTaxonomyById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-taxonomies"] });
      setToastData({
        show: true,
        message: "Taxonomy deleted successfully",
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
    setEditTaxonomyId(id);
    getTaxonomyByIdMutation.mutate(id);
    setShowModal(true);
  };

  const submitForm = () => {
    if (editTaxonomyId == null) {
      addTaxonomyMutation.mutate();
    } else {
      editTaxonomyMutation.mutate(editTaxonomyId);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-2">
      <TaxonomyForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={submitForm}
        onClear={clearForm}
        isEdit={false}
      />
      <TaxonomyTable
        onEdit={onEditOperation}
        onDelete={deleteTaxonomyMutation.mutate}
      />
      <Toast
        show={toastData.show}
        message={toastData.message}
        type={toastData.type}
        onClose={onToastClose}
      />
      <Modal isOpen={showModal} onClose={onModalClose}>
        <TaxonomyForm
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
