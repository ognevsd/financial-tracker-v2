import { Link } from "@tanstack/react-router";

interface NavItems {
  to: string;
  label: string;
}

export default function Navigation() {
  const navItems: NavItems[] = [
    { to: "/transactions", label: "Transactions" },
    { to: "/dividend-yield", label: "Dividend Yield" },
  ];
  return (
    <nav className="fixed top-0 left-0 right-0 h-16 border-b m-auto px-4">
      <ul className="h-16 items-center flex flex-row gap-4">
        {navItems.map((item) => (
          <li className="py-4 px-2 rounded-md hover:bg-red-100">
            <Link to={item.to}>{item.label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
