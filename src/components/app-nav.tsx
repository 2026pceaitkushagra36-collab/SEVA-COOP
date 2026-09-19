import Link from "next/link";

const navItems = [
  { href: "/", label: "Home" },
  { href: "/customer", label: "Customer" },
  { href: "/worker", label: "Worker" },
  { href: "/admin", label: "Admin" },
];

export function AppNav() {
  return (
    <header className="app-nav">
      <Link className="brand" href="/">
        <span>SC</span>
        <strong>SEVA-COOP</strong>
      </Link>
      <nav aria-label="Primary navigation">
        {navItems.map((item) => (
          <Link href={item.href} key={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
