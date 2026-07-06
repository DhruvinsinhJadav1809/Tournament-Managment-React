import { useNavigate, useLocation } from "react-router-dom";
import { LogOut, ChevronDown } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils";
import ThemeToggle from "./ThemeToggle";
import NotificationPanel from "./NotificationPanel";
import OnlineUsers from "./OnlineUsers";

// ─── Page title map ───────────────────────────────────────────────────────────
const pageTitles: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": { title: "Dashboard", subtitle: "Overview of your activity" },
  "/games": { title: "Games", subtitle: "Manage all games" },
  "/tournaments": { title: "Tournaments", subtitle: "Manage all tournaments" },
  "/users": { title: "Users", subtitle: "View registered users" },
  "/announcements": {
    title: "Announcements",
    subtitle: "Broadcasts and messages",
  },
  "/schedule": { title: "Schedule", subtitle: "Your match calendar" },
  "/profile": { title: "My Profile", subtitle: "Stats and match history" },
};

// ─── User dropdown ────────────────────────────────────────────────────────────
function UserDropdown() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const initials =
    user?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) ?? "?";

  const handleLogout = () => {
    logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl transition-all",
          open
            ? "bg-gray-100 dark:bg-gray-800"
            : "hover:bg-gray-100 dark:hover:bg-gray-800",
        )}
      >
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-bold shrink-0">
          {initials}
        </div>
        <div className="text-left hidden sm:block">
          <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-none">
            {user?.fullName}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-none">
            {user?.role}
          </p>
        </div>
        <ChevronDown
          size={14}
          className={cn(
            "text-gray-400 dark:text-gray-500 transition-transform hidden sm:block",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-12 w-56 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-50 dark:border-gray-800">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {user?.fullName}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 truncate mt-0.5">
              {user?.email}
            </p>
            <span className="inline-flex mt-1.5 text-[10px] font-medium bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full border border-brand-100 dark:border-brand-900">
              {user?.role}
            </span>
          </div>

          {/* Actions */}
          <div className="p-1.5">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 transition-colors"
            >
              <LogOut size={16} />
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Top Bar ──────────────────────────────────────────────────────────────────
export default function TopBar() {
  const location = useLocation();
  const { isAdmin } = useAuth();

  const page = pageTitles[location.pathname] ?? {
    title: "Tournament Management",
    subtitle: "",
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between px-6 shrink-0 sticky top-0 z-40">
      {/* Left — page title */}
      <div>
        <h1 className="text-base font-bold text-gray-900 dark:text-gray-100 leading-none">
          {page.title}
        </h1>
        {page.subtitle && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-none">
            {page.subtitle}
          </p>
        )}
      </div>

      {/* Right — actions */}
      <div className="flex items-center gap-1.5">
        {isAdmin && <OnlineUsers />}
        <ThemeToggle />
        <NotificationPanel />
        <div className="w-px h-6 bg-gray-100 dark:bg-gray-800 mx-1" />
        <UserDropdown />
      </div>
    </header>
  );
}
