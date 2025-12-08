import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import Navigation from "../components/Navigation";

export const Route = createRootRoute({
  component: () => {
    return (
      <>
        <Navigation />
        <div
          className="
            mt-18
            overflow-y-auto
            min-w-screen
            px-4
            min-h-[calc(100vh-4.5rem)]
          "
        >
          <Outlet />
          <ReactQueryDevtools />
          <TanStackRouterDevtools />
        </div>
      </>
    );
  },
});
