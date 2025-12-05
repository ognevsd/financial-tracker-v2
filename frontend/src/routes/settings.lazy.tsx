import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import OperationsSettings from "../components/OperationsSettings";
import Button from "../components/ui/button";
import CurrencySettings from "../components/CurrencySettings";
import AssetTypeSettings from "../components/AssetTypeSettings";

export const Route = createLazyFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const [activeSection, setActiveSection] = useState<string>("operations");

  const settingsItems = [
    { id: "operations", label: "Operations" },
    { id: "currency", label: "Currencies" },
    { id: "assetType", label: "Asset Type" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "operations":
        return <OperationsSettings />;
      case "currency":
        return <CurrencySettings />;
      case "assetType":
        return <AssetTypeSettings />;
    }
  };

  return (
    <div className="flex flex-1 overflow-hidden">
      <aside className="w-48 md:w-64 shrink-0 overflow-y-auto">
        <nav className="p-6 space-y-2">
          {settingsItems.map((item) => (
            <Button
              key={item.id}
              variant={activeSection === item.id ? "default" : "secondary"}
              className="w-full"
              onClick={() => setActiveSection(item.id)}
            >
              {item.label}
            </Button>
          ))}
        </nav>
      </aside>
      <div className="flex-1 overflow-hiddenoperations">
        <div className="h-full overflow-y-auto px-2">{renderContent()}</div>
      </div>
    </div>
  );
}
