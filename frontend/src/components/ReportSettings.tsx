import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useEscModalClose } from "../hooks/useEscModalClose";
import AssetTypeForm from "./AssetTypeForm";
import type { AssetTypeFormData } from "../types/assetType";
import {
  DeleteAssetTypeById,
  getAssetTypeById,
  updateAssetTypeById,
} from "../api/assetType";
import { defaultToastData, type ToastData } from "../types/toast";
import ReportForm from "./ReportForm";
import ReportTable from "./ReportTable";
import type { ReportFormData } from "../types/report";
import { addReport, getReportById } from "../api/report";

const defaultFormData: ReportFormData = {
  id: "",
  name: "",
};

export default function ReportSettings() {
  const [formData, setFormData] = useState<AssetTypeFormData>(defaultFormData);
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

  const editAssetTypeMutation = useMutation({
    mutationFn: (id: string) => updateAssetTypeById(id, formData.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-reports"] });
      setToastData({
        show: true,
        message: `Asset type ${formData.name} updated`,
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

  const deleteAssetType = useMutation({
    mutationFn: (id: string) => DeleteAssetTypeById(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-asset-types"] });
      setToastData({
        show: true,
        message: "Asset type deleted successfully",
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
    fetchReportMutation.mutate(id);
    setShowModal(true);
  };

  const submitForm = () => {
    if (editOperationId == null) {
      addReportMutation.mutate();
    } else {
      editAssetTypeMutation.mutate(editOperationId);
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
      <ReportTable onEdit={onEditOperation} onDelete={deleteAssetType.mutate} />
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
