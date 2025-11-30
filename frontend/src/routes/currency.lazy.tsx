import { createLazyFileRoute } from "@tanstack/react-router";
import CurrencyForm from "../components/CurrencyForm";

export const Route = createLazyFileRoute("/currency")({
  component: RouteComponent,
});

function RouteComponent() {
  return <CurrencyForm />;
}
