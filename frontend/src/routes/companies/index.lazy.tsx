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

// const incomeStatement = {
//   company_id: 123,
//   years: [2024, 2023, 2022],
//   sections: {
//     revenue: [
//       {
//         taxonomy: "",
//         order: 1,
//         label: "Net sales",
//         data: [279030, 244264, 226222],
//       },
//       {
//         taxonomy: "",
//         order: 2,
//         label: "Other operating revenues",
//         data: [279793, 245088, 226740],
//       },
//     ],
//     expenses: [
//       {
//         taxonomy: "",
//         order: 3,
//         label: "Cost of goods sold",
//         data: [151057, 134228, 126440],
//       },
//     ],
//   },
// };
//
// const bsMapping = [
//   {
//     id: "a",
//     taxonomy_id: "a",
//     original_name: "Prperty, plant, equipment",
//     report_id: "a",
//     section_id: "a",
//     order_index: 1,
//   },
//   {
//     id: "b",
//     taxonomy_id: "b",
//     original_name: "Cash and cash equivalents",
//     report_id: "a",
//     section_id: "b",
//     order_index: 1,
//   },
//   {
//     id: "c",
//     taxonomy_id: "d",
//     original_name: "Inventories",
//     report_id: "a",
//     section_id: "b",
//     order_index: 2,
//   },
//   {
//     id: "d",
//     taxonomy_id: "",
//     original_name: "Current Assets",
//     report_id: "a",
//     section_id: "b",
//     order_index: 3,
//   },
// ];
//
// const reports = [
//   {
//     id: "a",
//     name: "Balance Sheet",
//   },
// ];
//
// const sections = [
//   {
//     id: "a",
//     report_id: "a",
//     name: "Non-Current Assets",
//   },
//   {
//     id: "b",
//     report_id: "a",
//     name: "Current Assets",
//   },
// ];
//
// const taxonomy = [
//   {
//     id: "a",
//     name: "BS_PPE",
//   },
//   {
//     id: "b",
//     name: "BS_CASH",
//   },
//   {
//     id: "c",
//     name: "BS_ASS",
//   },
//   {
//     id: "d",
//     name: "BS_INV",
//   },
// ];
//
// // Doing setup for revenue in fin report
// function RouteComponent() {
//   const [bsFields, setBsFields] = useState(bsMapping);
//
//   const bsId = reports.find((item) => item.name === "Balance Sheet")?.id;
//   const bsSections = sections.filter((item) => item.report_id === bsId);
//
//   const updateField = (value: string, field: string, field_id: string) => {
//     setBsFields((prevState) =>
//       prevState.map((item) =>
//         item.id === field_id ? { ...item, [field]: value } : item,
//       ),
//     );
//   };
//
//   const updateTaxonomy = (value: string, item_id: string) => {
//     setBsFields((prevState) =>
//       prevState.map((item) =>
//         item.id === item_id ? { ...item, taxonomy_id: value } : item,
//       ),
//     );
//   };
//
//   const onSaveButton = () => {
//     console.log(bsFields);
//   };
//   const onCancelButton = () => {
//     console.log("Cancel not working");
//   };
//   const moveRow = (index: number, direction: number, section_id: string) => {
//     const sectionItems = bsFields
//       .filter((item) => item.section_id === section_id)
//       .sort((a, b) => a.order_index - b.order_index);
//
//     if (index + direction < 0 || index + direction >= sectionItems.length) {
//       return;
//     }
//
//     const itemToMove = sectionItems[index];
//     const itemToSwap = sectionItems[index + direction];
//
//     setBsFields((prevState) =>
//       prevState.map((item) => {
//         if (item.id === itemToMove.id) {
//           return { ...item, order_index: itemToSwap.order_index };
//         }
//         if (item.id === itemToSwap.id) {
//           return { ...item, order_index: itemToMove.order_index };
//         }
//         return item;
//       }),
//     );
//   };
//
//   const onUpButton = (index: number, section_id: string) => {
//     moveRow(index, -1, section_id);
//   };
//   const onDownButton = (index: number, section_id: string) => {
//     moveRow(index, 1, section_id);
//   };
//   const onDeleteButton = () => {
//     console.log("Delete");
//   };
//   const addField = (sectionId: string) => {
//     // Should be an API call instead
//     setBsFields((prevState) => [
//       ...prevState,
//       { id: "e", section_id: sectionId, taxonomy_id: "", original_name: "" },
//     ]);
//   };
//
//   const navigate = useNavigate({ from: "/companies" });
//   const handleRowClick = (companyId: string) => {
//     navigate({
//       to: "/companies/$companyId",
//       params: { companyId },
//     });
//   };
//
//   return (
//     <div className="space-y-2">
//       <div className="flex gap-3 items-center">
//         <Button onClick={onSaveButton}>Save</Button>
//         <Button variant="secondary" onClick={onCancelButton}>
//           Cancel
//         </Button>
//       </div>
//       <div onClick={() => handleRowClick("xxx")}>Company XXX</div>
//       {/* Table settings */}
//       <h2>Balance Sheet</h2>
//       {bsSections.map((section) => (
//         <div key={`${section.id}-table`}>
//           <h3 key={section.id}>{section.name}</h3>
//           <table key={`${section.id}-table`}>
//             <thead className="bg-gray-200">
//               <tr>
//                 <th className="px-4 py-2">#</th>
//                 <th className="px-4 py-2 min-w-50">Taxonomy</th>
//                 <th className="px-4 py-2 min-w-sm">Original Name</th>
//                 <th />
//               </tr>
//             </thead>
//             <tbody>
//               {bsFields
//                 .filter((item) => item.section_id === section.id)
//                 .slice()
//                 .sort((a, b) => a.order_index - b.order_index)
//                 .map((item, index, sectionItems) => (
//                   <tr key={item.id}>
//                     <td className="px-2 py-2">{item.order_index}</td>
//                     <td className="px-2 py-2">
//                       <Select
//                         value={item.taxonomy_id}
//                         onChange={(e) =>
//                           updateTaxonomy(e.target.value, item.id)
//                         }
//                       >
//                         <SelectOption value=""></SelectOption>
//                         {taxonomy.map((taxonomy) => (
//                           <SelectOption key={taxonomy.id} value={taxonomy.id}>
//                             {taxonomy.name}
//                           </SelectOption>
//                         ))}
//                       </Select>
//                     </td>
//                     <td className="px-2 py-2">
//                       <Input
//                         value={item.original_name}
//                         onChange={(e) =>
//                           updateField(e.target.value, "original_name", item.id)
//                         }
//                       />
//                     </td>
//                     <td className="px-2 py-2 space-x-1">
//                       <Button
//                         type="button"
//                         disabled={index === 0 ? true : false}
//                         variant="secondary"
//                         onClick={() => {
//                           onUpButton(index, section.id);
//                         }}
//                       >
//                         <MoveUp size={16} />
//                       </Button>
//                       <Button
//                         disabled={
//                           index === sectionItems.length - 1 ? true : false
//                         }
//                         onClick={() => onDownButton(index, section.id)}
//                         variant="secondary"
//                       >
//                         <MoveDown size={16} />
//                       </Button>
//                       <Button onClick={onDeleteButton} variant="secondary">
//                         <Trash2 />
//                       </Button>
//                     </td>
//                   </tr>
//                 ))}
//             </tbody>
//           </table>
//           <Button variant="secondary">Add Item</Button>
//         </div>
//       ))}
//       {/* Financial info */}
//       <table>
//         <thead className="bg-gray-200">
//           <tr>
//             <th className="px-4 py-2">Field</th>
//             {incomeStatement.years.map((year) => (
//               <th key={year} className="px-4 py-2">
//                 {year}
//               </th>
//             ))}
//           </tr>
//         </thead>
//         <tbody></tbody>
//       </table>
//     </div>
//   );
// }
