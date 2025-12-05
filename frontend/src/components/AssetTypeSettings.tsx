import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  addOperation,
  DeleteOperationById,
  getOperationById,
  updateOperationById,
} from "../api/operations";
import type { ToastType } from "../components/Toast";
import Toast from "../components/Toast";
import Modal from "../components/Modal";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";
import { useEscModalClose } from "../hooks/useEscModalClose";
import AssetTypeForm from "./AssetTypeForm";
import AssetTypeTable from "./AssetTypeTable";
import type { AssetTypeFormData } from "../types/assetType";
import {
  addAssetType,
  DeleteAssetTypeById,
  getAssetTypeById,
  updateAssetTypeById,
} from "../api/assetType";

interface ToastData {
  show: boolean;
  message: string;
  type: ToastType;
}
const defaultFormData: AssetTypeFormData = {
  id: "",
  name: "",
};
const defaultToastData: ToastData = {
  show: false,
  message: "",
  type: "standard",
};

export default function AssetTypeSettings() {
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

  const addAssetTypeMutation = useMutation({
    mutationFn: () => addAssetType(formData.name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-asset-types"] });
      setToastData({
        show: true,
        message: `Asset type ${formData.name} added successfully`,
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

  const fetchAssetTypeMutation = useMutation({
    mutationFn: (id: string) => getAssetTypeById(id),
    onSuccess: (data) => {
      setFormData(data.assetType);
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
      queryClient.invalidateQueries({ queryKey: ["all-asset-types"] });
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
    fetchAssetTypeMutation.mutate(id);
    setShowModal(true);
  };

  const submitAssetTypeForm = () => {
    if (editOperationId == null) {
      addAssetTypeMutation.mutate();
    } else {
      editAssetTypeMutation.mutate(editOperationId);
    }
    setShowModal(false);
  };

  return (
    <div className="space-y-2">
      <AssetTypeForm
        formData={formData}
        setFormData={setFormData}
        onSubmit={submitAssetTypeForm}
        onClear={clearForm}
        isEdit={false}
      />
      <AssetTypeTable
        onEdit={onEditOperation}
        onDelete={deleteAssetType.mutate}
      />
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
          onSubmit={submitAssetTypeForm}
          onClear={clearForm}
          isEdit={true}
        />
      </Modal>
    </div>
  );
}
