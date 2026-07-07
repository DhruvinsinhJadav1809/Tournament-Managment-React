import { NavLink } from "react-router-dom";
import {
  Trophy,
  Gamepad2,
  Users,
  LayoutDashboard,
  ChevronRight,
  Megaphone,
  CalendarDays,
  UserCircle,
  MessageCircle,
} from "lucide-react";
import { cn } from "@/utils";
import { useAuth } from "@/hooks/useAuth";

interface NavItem {
  to: string;
  label: string;
  icon: React.ElementType;
  adminOnly?: boolean;
  userOnly?: boolean;
}

const navItems: NavItem[] = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/games", label: "Games", icon: Gamepad2, adminOnly: true },
  { to: "/tournaments", label: "Tournaments", icon: Trophy, adminOnly: true },
  { to: "/users", label: "Users", icon: Users, adminOnly: true },
  { to: "/announcements", label: "Announcements", icon: Megaphone },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/profile", label: "My Profile", icon: UserCircle, userOnly: true },
  { to: "/messages", label: "Messages", icon: MessageCircle },
];

export default function Sidebar() {
  const { isAdmin } = useAuth();

  const visibleItems = navItems.filter((item) => {
    if (item.adminOnly && !isAdmin) return false;
    if (item.userOnly && isAdmin) return false;
    return true;
  });

  return (
    <aside className="w-56 min-h-screen bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center shrink-0">
            <Trophy size={16} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none">
              Tournament
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 leading-none mt-0.5">
              Management
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {visibleItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group",
                isActive
                  ? "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100",
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <Icon
                    size={18}
                    className={cn(
                      "transition-colors shrink-0",
                      isActive
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300",
                    )}
                  />
                  {label}
                </div>
                {isActive && (
                  <ChevronRight size={14} className="text-brand-400 shrink-0" />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* App version */}
      <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800">
        <p className="text-xs text-gray-300 dark:text-gray-600">v1.0.0</p>
      </div>
    </aside>
  );
}
