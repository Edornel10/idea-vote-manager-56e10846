
import { NavigationLink } from "./NavigationLink";
import { User } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{
    path: string;
    label: string;
    requireAuth: boolean;
    requireAdmin?: boolean;
    hideWhenAuth?: boolean;
  }>;
  user: User | null;
  onLogout: () => void;
}

export function MobileNav({ isOpen, onClose, links, user, onLogout }: MobileNavProps) {
  return (
    <div
      className={cn(
        "fixed inset-x-0 top-16 bg-background border-b border-border md:hidden",
        isOpen ? "block" : "hidden"
      )}
    >
      <div className="px-2 pt-2 pb-3 space-y-1">
        {links.map((link) => {
          if (link.requireAuth && !user) return null;
          if (link.requireAdmin && user?.role !== "admin") return null;
          if (link.hideWhenAuth && user) return null;

          return (
            <div key={link.path} onClick={onClose} className="block">
              <NavigationLink to={link.path} label={link.label} />
            </div>
          );
        })}
        {user && (
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="text-white hover:text-gray-300 block w-full text-left px-3 py-2 rounded-md text-sm font-medium"
          >
            Logout
          </button>
        )}
      </div>
    </div>
  );
}
