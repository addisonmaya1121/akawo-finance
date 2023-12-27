import { cn } from "@/lib/utils";
import { Link, useLocation } from "react-router-dom";

const links = [
  {
    to: "/token-locker",
    label: "All locks",
  },
  {
    to: "/token-locker/my",
    label: "My locks",
  },
];

export default function TokenLockerNavigations() {
  const { pathname } = useLocation();
  return (
    <div className="flex flex-wrap items-center px-2 py-2 border rounded-md bg-accent text-accent-foreground">
      {links.map((item, key) => (
        <Link
          key={key}
          className={cn(
            "inline-flex items-center justify-center whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
            {
              "bg-background text-foreground shadow-sm": pathname === item.to,
            }
          )}
          to={item.to}
        >
          {item.label}
        </Link>
      ))}
    </div>
  );
}
