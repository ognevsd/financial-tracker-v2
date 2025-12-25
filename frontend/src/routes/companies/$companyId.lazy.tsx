import {
  createLazyFileRoute,
  Outlet,
  useMatchRoute,
  useNavigate,
} from "@tanstack/react-router";
import { Card } from "../../components/ui/card";
import Button from "../../components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { getAllReports } from "../../api/report";
import Loading from "../../components/Loading";

export const Route = createLazyFileRoute("/companies/$companyId")({
  component: RouteComponent,
});

function RouteComponent() {
  const { companyId } = Route.useParams();
  const navigate = useNavigate();
  const matchRoute = useMatchRoute();

  const settingsItems = [
    { id: "main", link: "/", label: "Main" },
    { id: "notes", link: "notes", label: "Notes" },
    { id: "locations", link: "locations", label: "Locations" },
    { id: "details", link: "details", label: "Details" },
  ];

  const { data, isLoading } = useQuery({
    queryFn: getAllReports,
    queryKey: ["all-reports"],
    staleTime: 120_000,
  });

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
            <h3>Reports</h3>
            {isLoading ? (
              <Loading />
            ) : (
              data?.report.map((item) => {
                const reportName = item.name.split(" ").join("-");
                const targetPath = `/companies/$companyId/${reportName}`;
                const isActive = matchRoute({
                  to: targetPath,
                  params: { companyId },
                });
                return (
                  <Button
                    key={item.id}
                    className="w-full justify-start"
                    variant={isActive ? "default" : "secondary"}
                    onClick={() => {
                      navigate({ to: targetPath, params: { companyId } });
                    }}
                  >
                    {item.name}
                  </Button>
                );
              })
            )}
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
