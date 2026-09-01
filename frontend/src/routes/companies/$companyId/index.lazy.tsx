import { createLazyFileRoute } from "@tanstack/react-router";

export const Route = createLazyFileRoute("/companies/$companyId/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { companyId } = Route.useParams();

  return (
    <div>
      <div>Company Name</div>
      <div>Current Holdings</div>
      <div>Dividiend yield details</div>
    </div>
  );
}
