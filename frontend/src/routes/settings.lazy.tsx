import { createLazyFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import OperationsSettings from "../components/OperationsSettings";
import Button from "../components/ui/button";
import CurrencySettings from "../components/CurrencySettings";
import AssetTypeSettings from "../components/AssetTypeSettings";
import { Card } from "../components/ui/card";
import ReportSettings from "../components/ReportSettings";
import ReportSectionSettings from "../components/ReportSectionSettings";
import TaxonomySettings from "../components/TaxonomySettings";

export const Route = createLazyFileRoute("/settings")({
  component: RouteComponent,
});

function RouteComponent() {
  const [activeSection, setActiveSection] = useState<string>("operations");

  const settingsItems = [
    { id: "operations", label: "Operations" },
    { id: "currency", label: "Currencies" },
    { id: "assetType", label: "Asset Type" },
    { id: "report", label: "Report" },
    { id: "reportSection", label: "Report Section" },
    { id: "taxonomy", label: "Taxonomy" },
  ];

  const renderContent = () => {
    switch (activeSection) {
      case "operations":
        return <OperationsSettings />;
      case "currency":
        return <CurrencySettings />;
      case "assetType":
        return <AssetTypeSettings />;
      case "report":
        return <ReportSettings />;
      case "reportSection":
        return <ReportSectionSettings />;
      case "taxonomy":
        return <TaxonomySettings />;
    }
  };

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      <Card
        className="
        h-full
        mb-2
        "
      >
        <aside className="w-48 md:w-64 shrink-0 h-full overflow-y-auto">
          <nav className="space-y-2">
            {settingsItems.map((item) => (
              <Button
                key={item.id}
                variant={activeSection === item.id ? "default" : "secondary"}
                className="w-full justify-start"
                onClick={() => setActiveSection(item.id)}
              >
                {item.label}
              </Button>
            ))}
          </nav>
        </aside>
      </Card>
      <div className="flex-1 h-full overflow-y-auto">
        <div className="h-full px-4">{renderContent()}</div>
      </div>
    </div>
  );
}
