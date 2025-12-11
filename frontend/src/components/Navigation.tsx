import { Link } from "@tanstack/react-router";
import { Card } from "./ui/card";

interface NavItems {
  to: string;
  label: string;
}

export default function Navigation() {
  const navItems: NavItems[] = [
    { to: "/transactions", label: "Transactions" },
    { to: "/companies", label: "Companies" },
    { to: "/dividend-yield", label: "Dividend Yield" },
    { to: "/settings", label: "Settings" },
  ];
  return (
    <Card className="fixed top-0 left-2 right-2 h-16 px-4 py-0 z-100">
      <nav className="">
        <ul className="h-16 items-center flex flex-row gap-4">
          {navItems.map((item) => (
            <li key={item.to}>
              <Link
                className="py-4 px-2 rounded-md hover:bg-secondary/80"
                to={item.to}
                activeProps={{
                  className:
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                }}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </Card>
  );
}
