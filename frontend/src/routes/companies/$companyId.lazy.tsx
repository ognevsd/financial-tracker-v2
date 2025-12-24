import {
  createLazyFileRoute,
  Outlet,
  useMatchRoute,
  useNavigate,
} from "@tanstack/react-router";
import { Card } from "../../components/ui/card";
import Button from "../../components/ui/button";

export const Route = createLazyFileRoute("/companies/$companyId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { companyId } = Route.useParams();
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const settingsItems = [
    { id: "main", link: "/", label: "Main" },
    { id: "details", link: "details", label: "Details" },
  ];

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      <Card className="h-full mb-2">
        <aside className="w-48 md:w-64 shrink-0 h-full overflow-y-auto">
          <nav className="space-y-2">
            {settingsItems.map((item) => {
              const targetPath = `/companies/$companyId/${item.link}`;
              const isActive = matchRoute({
                to: targetPath,
                params: { companyId },
              });
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "secondary"}
                  className="w-full justify-start"
                  onClick={() => {
                    navigate({ to: targetPath, params: { companyId } });
                  }}
                >
                  {item.label}
                </Button>
              );
            })}
          </nav>
        </aside>
      </Card>
      <div className="flex-1 h-full overflow-y-auto">
        <div className="h-full px-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
