import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

const Card = ({ className, ref, ...props }: ComponentProps<"div">) => (
  <div
    ref={ref}
    className={cn("rounded-md shadow-md bg-white px-4 py-4", className)}
    {...props}
  />
);
Card.displayName = "Card";

const CardHeader = ({ className, ref, ...props }: ComponentProps<"div">) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 py-2", className)}
    {...props}
  />
);
CardHeader.displayName = "CardHeader";

const CardTitle = ({ className, ref, ...props }: ComponentProps<"h3">) => (
  <h3
    ref={ref}
    className={cn(
      "text-xl font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
);
CardTitle.displayName = "CardTitle";

const CardContent = ({ className, ref, ...props }: ComponentProps<"div">) => (
  <div ref={ref} className={cn("", className)} {...props} />
);
CardContent.displayName = "CardHeader";

export { Card, CardHeader, CardTitle, CardContent };
