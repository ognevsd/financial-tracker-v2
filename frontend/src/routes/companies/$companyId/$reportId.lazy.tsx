import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/companies/$companyId/$reportId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { companyId, reportId } = Route.useParams();
  return (
    <div>
      Hello `/companies/{companyId}/{reportId}`!
    </div>
  );
}
