
import { NavLink } from "react-router-dom";
import { cn } from "../lib/utils";

interface NavigationLinkProps {
  to: string;
  label: string;
}

export function NavigationLink({ to, label }: NavigationLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium",
          "transition-colors duration-200",
          isActive && "bg-primary/10"
        )
      }
    >
      {label}
    </NavLink>
  );
}
