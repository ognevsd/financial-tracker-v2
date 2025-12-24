import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/companies/$companyId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { companyId } = Route.useParams();

  return <div>Hello `/companies/${companyId}/`!</div>;
}
