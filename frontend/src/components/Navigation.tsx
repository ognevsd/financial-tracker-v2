import { Link } from "@tanstack/react-router";

interface NavItems {
  to: string;
  label: string;
}

export default function Navigation() {
  const navItems: NavItems[] = [
    { to: "/transactions", label: "Transactions" },
    { to: "/dividend-yield", label: "Dividend Yield" },
    { to: "/currency", label: "Currencies" },
    { to: "/operations", label: "Operation"}
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b m-auto px-4 bg-white z-100">
      <ul className="h-16 items-center flex flex-row gap-4">
        {navItems.map((item) => (
          <li key={item.to}>
            <Link
              className="py-4 px-2 rounded-md hover:bg-amber-100"
              to={item.to}
              activeProps={{ className: "bg-blue-200" }}
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
