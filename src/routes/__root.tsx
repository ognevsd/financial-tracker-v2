import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import Navigation from "../components/Navigation";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <div className="">
          <Navigation />
          <div
            className="
            mt-16
            overflow-y-auto
            min-w-screen
            px-4
            min-h-[calc(100vh-4rem)]
          "
          >
            <Outlet />
            <TanStackRouterDevtools />
          </div>
        </div>
      </>
    );
  },
});
