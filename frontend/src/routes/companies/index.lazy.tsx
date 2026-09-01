import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import Button from "../../components/ui/button";
import AssetTable from "../../components/AssetTable";
import AssetForm from "../../components/AssetForm";
import Modal from "../../components/Modal";
import Toast from "../../components/Toast";
import { type AssetFormData } from "../../types/asset";
import { defaultToastData, type ToastData } from "../../types/toast";
import { useLockBodyScroll } from "../../hooks/useLockBodyScroll";
import { useEscModalClose } from "../../hooks/useEscModalClose";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addAsset } from "../../api/asset";

export const Route = createLazyFileRoute("/companies/")({
  component: RouteComponent,
});

const defaultFormData: AssetFormData = {
  ticker: "",
  name: "",
  assetTypeId: "",
  industry: "",
  commodity: "",
  currencyId: "",
  reportingMultiplicator: "",
};

function RouteComponent() {
  const [formData, setFormData] = useState<AssetFormData>(defaultFormData);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [toastData, setToastData] = useState<ToastData>(defaultToastData);

  const queryClient = useQueryClient();

  const onToastClose = () => setToastData(defaultToastData);
  const onModalClose = () => setShowModal(false);

  useLockBodyScroll(showModal);
  useEscModalClose(showModal, onModalClose);

  const clearForm = () => setFormData(defaultFormData);

  const addAssetMutation = useMutation({
    mutationFn: () => addAsset(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-assets"] });
      setToastData({
        show: true,
        message: `Asset ${formData.name} added successfully`,
        type: "success",
      });
      setFormData(defaultFormData);
    },
  });

  const onAddAssetClick = () => setShowModal(true);

  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <Button type="button" onClick={onAddAssetClick}>
          Add Asset
        </Button>
      </div>
      <AssetTable />
      <Modal isOpen={showModal} onClose={onModalClose}>
        <AssetForm
          formData={formData}
          setFormData={setFormData}
          onSubmit={addAssetMutation.mutate}
          onClear={clearForm}
          isEdit={false}
        />
      </Modal>
      <Toast
        show={toastData.show}
        message={toastData.message}
        type={toastData.type}
        onClose={onToastClose}
      />
    </div>
  );
}
