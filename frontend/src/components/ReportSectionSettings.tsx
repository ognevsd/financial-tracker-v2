import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useEscModalClose } from "../hooks/useEscModalClose";
import type { AssetTypeFormData } from "../types/assetType";
import { defaultToastData, type ToastData } from "../types/toast";
import {
  addReport,
  deleteReportById,
  getReportById,
  updateReport,
} from "../api/report";
import ReportSectionTable from "./ReportSectionTable";
import ReportSectionForm from "./ReportSectionForm";
import type { ReportSectionFormData } from "../types/reportSection";
import {
  addReportSection,
  deleteReportSectionById,
  getReportSectionById,
  updateReportSection,
} from "../api/reportSection";

const defaultFormData: ReportSectionFormData = {
  id: "",
  name: "",
  reportId: "",
  orderIndex: "",
};

export default function ReportSectionSettings() {
  const [formData, setFormData] =
    useState<ReportSectionFormData>(defaultFormData);
  const [toastData, setToastData] = useState<ToastData>(defaultToastData);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editReportId, setEditReportId] = useState<string | null>(null);

  const queryClient = useQueryClient();

  const clearForm = () => setFormData(defaultFormData);
  const onToastClose = () => setToastData(defaultToastData);
  const onModalClose = () => {
    setShowModal(false);
    setEditReportId(null);
    setFormData(defaultFormData);
  };

  useLockBodyScroll(showModal);
  useEscModalClose(showModal, onModalClose);

  const addReportSectionMutation = useMutation({
    mutationFn: () => addReportSection(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-report-sections"] });
      setToastData({
        show: true,
        message: `Report section ${formData.name} added successfully`,
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

  const getReportSectionByIdMutation = useMutation({
    mutationFn: (id: string) => getReportSectionById(id),
    onSuccess: (data) => {
      setFormData(data.reportSection);
    },
    onError: (e) => {
      setToastData({
        show: true,
        message: e.message,
        type: "error",
      });
    },
  });

  const editReportSectionMutation = useMutation({
    mutationFn: (id: string) => updateReportSection(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-report-sections"] });
      setToastData({
        show: true,
        message: `Report section ${formData.name} updated`,
        type: "success",
      });
      setEditReportId(null);
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

  const deleteReportSectionMutation = useMutation({
    mutationFn: (id: string) => deleteReportSectionById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-report-sections"] });
      setToastData({
        show: true,
        message: "Report section deleted successfully",
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
    setEditReportId(id);
    getReportSectionByIdMutation.mutate(id);
    setShowModal(true);
  };

  const submitForm = () => {
    if (editReportId == null) {
      addReportSectionMutation.mutate();
    } else {
      editReportSectionMutation.mutate(editReportId);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-2">
      <ReportSectionForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={submitForm}
        onClear={clearForm}
        isEdit={false}
      />
      <ReportSectionTable
        onEdit={onEditOperation}
        onDelete={deleteReportSectionMutation.mutate}
      />
      <Toast
        show={toastData.show}
        message={toastData.message}
        type={toastData.type}
        onClose={onToastClose}
      />
      <Modal isOpen={showModal} onClose={onModalClose}>
        <ReportSectionForm
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
