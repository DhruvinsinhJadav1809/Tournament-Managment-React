import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  Trophy,
  Calendar,
  Swords,
  Star,
  Info,
  X,
  Loader2,
} from "lucide-react";
import { notificationsApi, type Notification } from "@/api/notifications";
import toast from "react-hot-toast";

// ─── Notification icon by type + title ───────────────────────────────────────
function getNotificationIcon(notification: Notification) {
  const { title, type } = notification;
  const t = title.toLowerCase();

  if (t.includes("champion") || t.includes("won"))
    return { icon: Trophy, bg: "bg-amber-100", color: "text-amber-600" };
  if (t.includes("scheduled") || t.includes("match"))
    return { icon: Calendar, bg: "bg-brand-100", color: "text-brand-600" };
  if (t.includes("semi") || t.includes("final") || t.includes("advanced"))
    return { icon: Star, bg: "bg-purple-100", color: "text-purple-600" };
  if (t.includes("eliminat"))
    return { icon: X, bg: "bg-red-100", color: "text-red-500" };
  if (type === "Action")
    return { icon: Swords, bg: "bg-brand-100", color: "text-brand-600" };
  return { icon: Info, bg: "bg-gray-100", color: "text-gray-500" };
}

function timeAgo(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

// ─── Single notification row ──────────────────────────────────────────────────
function NotificationRow({
  notification,
  onMarkRead,
  isMarking,
}: {
  notification: Notification;
  onMarkRead: (id: string) => void;
  isMarking: boolean;
}) {
  const { icon: Icon, bg, color } = getNotificationIcon(notification);
  const isAction = notification.type === "Action";

  return (
    <div
      className={`relative flex gap-3 px-4 py-3.5 transition-colors hover:bg-gray-50 ${
        !notification.isRead ? "bg-brand-50/40 dark:bg-brand-950/40" : ""
      }`}
    >
      {/* Unread dot */}
      {!notification.isRead && (
        <div className="absolute left-1.5 top-1/3 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-brand-500" />
      )}

      {/* Icon */}
      <div
        className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center shrink-0 mt-0.5`}
      >
        <Icon size={16} className={color} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className={`text-sm leading-snug ${
              !notification.isRead
                ? "font-semibold text-gray-900 dark:text-gray-100"
                : "font-medium text-gray-700 dark:text-gray-300"
            }`}
          >
            {notification.title}
          </p>
          <span className="text-xs text-gray-400 shrink-0 mt-0.5">
            {timeAgo(notification.createdAt)}
          </span>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
          {notification.message}
        </p>

        <div className="flex items-center justify-between mt-1.5">
          <span
            className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full ${
              isAction
                ? "bg-brand-100 text-brand-600"
                : "bg-gray-100 text-gray-500"
            }`}
          >
            {notification.type}
          </span>

          {!notification.isRead && (
            <button
              onClick={() => onMarkRead(notification.id)}
              disabled={isMarking}
              className="text-[10px] text-brand-500 hover:text-brand-700 font-medium transition-colors disabled:opacity-50"
            >
              {isMarking ? "Marking..." : "Mark read"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Main panel ───────────────────────────────────────────────────────────────
export default function NotificationPanel() {
  const [open, setOpen] = useState(false);
  const [markingId, setMarkingId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const qc = useQueryClient();
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const { data: countData } = useQuery({
    queryKey: ["notification-count"],
    queryFn: () => notificationsApi.getUnreadCount().then((r) => r.data.data),
    refetchInterval: 30000, // poll every 30s
  });

  const { data, isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationsApi.getAll().then((r) => r.data.data),
    enabled: open,
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["notifications"] });
    qc.invalidateQueries({ queryKey: ["notification-count"] });
  };

  const markReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onMutate: (id) => setMarkingId(id),
    onSuccess: () => invalidate(),
    onError: () => toast.error("Failed to mark as read"),
    onSettled: () => setMarkingId(null),
  });

  const markAllMutation = useMutation({
    mutationFn: notificationsApi.markAllAsRead,
    onSuccess: () => {
      invalidate();
      toast.success("All notifications marked as read");
    },
    onError: () => toast.error("Failed to mark all as read"),
  });

  const notifications = data || [];
  const unread = countData ?? 0;
  const hasUnread = unread > 0;

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className={`relative p-2 rounded-xl transition-colors ${
          open
            ? "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400"
            : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
        }`}
      >
        <Bell size={20} />
        {hasUnread && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 animate-pulse">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div
          className="fixed w-96 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-[100] flex flex-col max-h-[560px]"
          style={{
            top: buttonRef.current
              ? buttonRef.current.getBoundingClientRect().bottom + 8
              : 70,
            right: 16,
          }}
        >
          {" "}
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3.5 border-b border-gray-100 dark:border-zinc-700/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                Notifications
              </h3>
              {hasUnread && (
                <span className="text-xs font-medium bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {hasUnread && (
                <button
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  className="flex items-center gap-1 text-xs text-brand-600  dark:text-brand-400 hover:text-brand-700 font-medium transition-colors disabled:opacity-50"
                >
                  {markAllMutation.isPending ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <CheckCheck size={13} />
                  )}
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X size={15} />
              </button>
            </div>
          </div>
          {/* Body */}
          <div className="overflow-y-auto flex-1">
            {isLoading ? (
              <div className="space-y-0 divide-y divide-gray-50">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex gap-3 px-4 py-3.5 animate-pulse">
                    <div className="w-9 h-9 rounded-xl bg-gray-100 dark:bg-zinc-900 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex justify-between gap-4">
                        <div className="h-3.5 bg-gray-100 dark:bg-zinc-900 rounded w-1/2" />
                        <div className="h-3 bg-gray-100 rounded w-12" />
                      </div>
                      <div className="h-3 bg-gray-100 rounded w-4/5" />
                      <div className="h-3 bg-gray-100 rounded w-2/3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-zinc-900 flex items-center justify-center mb-3">
                  <Bell size={22} className="text-gray-300" />
                </div>
                <p className="text-sm font-medium text-gray-500">
                  All caught up!
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  No notifications yet.
                </p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((n) => (
                  <NotificationRow
                    key={n.id}
                    notification={n}
                    onMarkRead={(id) => markReadMutation.mutate(id)}
                    isMarking={markingId === n.id && markReadMutation.isPending}
                  />
                ))}
              </div>
            )}
          </div>
          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-50 dark:border-zinc-700/50 text-center">
              <p className="text-xs text-gray-400 dark:text-gray-600">
                {notifications.length} notification
                {notifications.length !== 1 ? "s" : ""} total
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
