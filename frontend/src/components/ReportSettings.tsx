import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useEscModalClose } from "../hooks/useEscModalClose";
import AssetTypeForm from "./AssetTypeForm";
import type { AssetTypeFormData } from "../types/assetType";
import { defaultToastData, type ToastData } from "../types/toast";
import ReportForm from "./ReportForm";
import ReportTable from "./ReportTable";
import type { ReportFormData } from "../types/report";
import {
  addReport,
  deleteReportById,
  getReportById,
  updateReport,
} from "../api/report";

const defaultFormData: ReportFormData = {
  id: "",
  name: "",
};

export default function ReportSettings() {
  const [formData, setFormData] = useState<AssetTypeFormData>(defaultFormData);
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

  const addReportMutation = useMutation({
    mutationFn: () => addReport(formData.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-reports"] });
      setToastData({
        show: true,
        message: `Report ${formData.name} added successfully`,
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

  const fetchReportMutation = useMutation({
    mutationFn: (id: string) => getReportById(id),
    onSuccess: (data) => {
      setFormData(data.report);
    },
    onError: (e) => {
      setToastData({
        show: true,
        message: e.message,
        type: "error",
      });
    },
  });

  const editReportMutation = useMutation({
    mutationFn: (id: string) => updateReport(id, formData.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-reports"] });
      setToastData({
        show: true,
        message: `Asset type ${formData.name} updated`,
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

  const deleteReport = useMutation({
    mutationFn: (id: string) => deleteReportById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-reports"] });
      setToastData({
        show: true,
        message: "Report deleted successfully",
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
    fetchReportMutation.mutate(id);
    setShowModal(true);
  };

  const submitForm = () => {
    if (editReportId == null) {
      addReportMutation.mutate();
    } else {
      editReportMutation.mutate(editReportId);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-2">
      <ReportForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={submitForm}
        onClear={clearForm}
        isEdit={false}
      />
      <ReportTable onEdit={onEditOperation} onDelete={deleteReport.mutate} />
      <Toast
        show={toastData.show}
        message={toastData.message}
        type={toastData.type}
        onClose={onToastClose}
      />
      <Modal isOpen={showModal} onClose={onModalClose}>
        <AssetTypeForm
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
