import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Wifi, X } from "lucide-react";
import { onlineUsersApi } from "@/api/onlineUsers";

export default function OnlineUsers() {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const { data } = useQuery({
    queryKey: ["online-users"],
    queryFn: () => onlineUsersApi.getOnlineUsers().then((r) => r.data.data),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    staleTime: 0,
  });

  const count = data?.onlineUserCount ?? 0;
  const users = data?.users ?? [];

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`relative flex items-center gap-1.5 px-2 py-1.5 rounded-xl transition-colors ${
          open
            ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
        title="Online users"
      >
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
          {count}
        </span>
        <Users size={15} />
      </button>

      {/* Panel — fixed position to avoid sidebar overflow */}
      {open && (
        <div
          className="fixed w-72 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-[100] overflow-hidden"
          style={{
            top: panelRef.current
              ? panelRef.current.getBoundingClientRect().bottom + 8
              : 60,
            left: panelRef.current
              ? panelRef.current.getBoundingClientRect().left
              : 16,
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <Wifi size={14} className="text-emerald-500" />
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Online Now
              </h3>
              <span className="text-xs font-medium bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full">
                {count}
              </span>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <X size={14} />
            </button>
          </div>

          {/* User list */}
          <div className="max-h-64 overflow-y-auto">
            {users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-2">
                  <Users
                    size={18}
                    className="text-gray-300 dark:text-gray-600"
                  />
                </div>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  No users online
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50 dark:divide-gray-800">
                {users.map((u) => (
                  <div
                    key={u.userId}
                    className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  >
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-bold">
                        {u.userName?.[0]?.toUpperCase() ?? "?"}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-gray-900" />
                    </div>
                    <span className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                      {u.userName}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 border-t border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
            <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
              Updates in real-time via SignalR
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
