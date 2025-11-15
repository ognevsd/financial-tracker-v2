import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/router-devtools";
import Navigation from "../components/Navigation";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <div className="">
          <Navigation />
          <div className="mt-16 overflow-y-auto min-w-screen px-4 bg-red-50">
            <div>This is root component</div>
            <Outlet />
            <div>Something below outlet</div>
            <TanStackRouterDevtools />
          </div>
        </div>
      </>
    );
  },
});
