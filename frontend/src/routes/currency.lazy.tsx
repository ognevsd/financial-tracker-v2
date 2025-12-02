import { createLazyFileRoute } from "@tanstack/react-router";
import CurrencyForm from "../components/CurrencyForm";
import CurrencyTable from "../components/CurrencyTable";

export const Route = createLazyFileRoute("/currency")({
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <>
      <CurrencyForm />
      <CurrencyTable />
    </>
  );
}
