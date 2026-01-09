import { createLazyFileRoute, useNavigate } from "@tanstack/react-router";

export const Route = createLazyFileRoute(
  "/companies/$companyId/$reportId/edit",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();
  const { companyId } = Route.useParams();
  console.log(companyId);
  return <div>Hello "/companies/$companyId/$reportId/edit"!</div>;
}
