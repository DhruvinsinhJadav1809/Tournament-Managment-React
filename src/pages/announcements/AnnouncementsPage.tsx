import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Megaphone,
  Info,
  Trophy,
  Swords,
  AlertTriangle,
  Zap,
  CheckCircle2,
  Plus,
  Clock,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  announcementsApi,
  type Announcement,
  type AnnouncementType,
  type AnnouncementPriority,
} from "@/api/announcements";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/utils";
import PageLayout from "@/components/common/PageLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import CreateAnnouncementModal from "./CreateAnnouncementModal";

// ─── Type config ──────────────────────────────────────────────────────────────
const typeConfig: Record<
  AnnouncementType,
  {
    icon: React.ElementType;
    bg: string;
    color: string;
    variant: "info" | "success" | "warning" | "danger" | "default";
  }
> = {
  Information: {
    icon: Info,
    bg: "bg-brand-50 dark:bg-brand-950",
    color: "text-brand-600 dark:text-brand-400",
    variant: "info",
  },
  Tournament: {
    icon: Trophy,
    bg: "bg-amber-50 dark:bg-amber-950",
    color: "text-amber-600 dark:text-amber-400",
    variant: "warning",
  },
  Match: {
    icon: Swords,
    bg: "bg-purple-50 dark:bg-purple-950",
    color: "text-purple-600 dark:text-purple-400",
    variant: "default",
  },
  Warning: {
    icon: AlertTriangle,
    bg: "bg-orange-50 dark:bg-orange-950",
    color: "text-orange-500 dark:text-orange-400",
    variant: "warning",
  },
  Urgent: {
    icon: Zap,
    bg: "bg-red-50 dark:bg-red-950",
    color: "text-red-500 dark:text-red-400",
    variant: "danger",
  },
};

const priorityConfig: Record<
  AnnouncementPriority,
  {
    label: string;
    variant: "info" | "success" | "warning" | "danger" | "default";
    dot: string;
  }
> = {
  Low: { label: "Low", variant: "default", dot: "bg-gray-400" },
  Normal: { label: "Normal", variant: "info", dot: "bg-brand-500" },
  High: { label: "High", variant: "warning", dot: "bg-amber-500" },
  Critical: {
    label: "Critical",
    variant: "danger",
    dot: "bg-red-500 animate-pulse",
  },
};

// ─── Announcement Card ────────────────────────────────────────────────────────
function AnnouncementCard({ announcement }: { announcement: Announcement }) {
  const type = typeConfig[announcement.type] ?? typeConfig.Information;
  const priority =
    priorityConfig[announcement.priority] ?? priorityConfig.Normal;
  const Icon = type.icon;
  const isExpired = announcement.expireAt
    ? new Date(announcement.expireAt) < new Date()
    : false;

  return (
    <div
      className={`relative bg-white dark:bg-gray-900 rounded-2xl border shadow-card transition-all duration-200 overflow-hidden ${
        !announcement.isRead
          ? "border-brand-200 dark:border-brand-800"
          : "border-gray-100 dark:border-gray-800"
      } ${isExpired ? "opacity-60" : ""}`}
    >
      {/* Unread indicator */}
      {!announcement.isRead && (
        <div className="absolute top-0 left-0 w-1 h-full bg-brand-500 rounded-l-2xl" />
      )}

      <div className="p-5 pl-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div
            className={`w-10 h-10 rounded-xl ${type.bg} flex items-center justify-center shrink-0 mt-0.5`}
          >
            <Icon size={18} className={type.color} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 mb-1">
              <h3
                className={`text-sm font-semibold leading-snug ${
                  !announcement.isRead
                    ? "text-gray-900 dark:text-gray-100"
                    : "text-gray-700 dark:text-gray-300"
                }`}
              >
                {announcement.title}
              </h3>
              <div className="flex items-center gap-2 shrink-0">
                <div className={`w-2 h-2 rounded-full ${priority.dot}`} />
                <Badge variant={priority.variant} className="text-[10px]">
                  {priority.label}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-3">
              {announcement.message}
            </p>

            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <Badge variant={type.variant} className="text-[10px]">
                  {announcement.type}
                </Badge>
                <div className="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500">
                  <Clock size={11} />
                  {formatDate(announcement.createdAt)}
                </div>
                {announcement.expireAt && (
                  <div
                    className={`flex items-center gap-1 text-xs ${
                      isExpired
                        ? "text-red-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  >
                    {isExpired
                      ? "⚠️ Expired"
                      : `Expires ${formatDate(announcement.expireAt)}`}
                  </div>
                )}
              </div>

              {announcement.isRead && (
                <span className="flex items-center gap-1 text-xs text-gray-300 dark:text-gray-600">
                  <CheckCircle2 size={12} /> Read
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 animate-pulse">
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex justify-between">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-1/3" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-16" />
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-4/5" />
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded w-2/3" />
          <div className="flex gap-2 pt-1">
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-20" />
            <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded w-24" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AnnouncementsPage() {
  const { isAdmin } = useAuth();
  const qc = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>("All");
  const [filterRead, setFilterRead] = useState<string>("All");

  const { data, isLoading } = useQuery({
    queryKey: ["announcements"],
    queryFn: () => announcementsApi.getAll().then((r) => r.data.data ?? []),
  });

  const createMutation = useMutation({
    mutationFn: announcementsApi.create,
    onSuccess: async () => {
      toast.success("Announcement sent!");
      await qc.invalidateQueries({ queryKey: ["announcements"] });
      setCreateOpen(false);
    },
    onError: () => toast.error("Failed to send announcement."),
  });

  const announcements = data ?? [];
  const unreadCount = announcements.filter((a) => !a.isRead).length;

  // Filter
  const filtered = announcements.filter((a) => {
    if (filterType !== "All" && a.type !== filterType) return false;
    if (filterRead === "Unread" && a.isRead) return false;
    if (filterRead === "Read" && !a.isRead) return false;
    return true;
  });

  return (
    <PageLayout
      heading="Announcements"
      subtitle={
        isAdmin
          ? "Create and manage announcements for players"
          : "Stay updated with the latest announcements"
      }
      action={
        isAdmin ? (
          <Button
            leftIcon={<Plus size={16} />}
            onClick={() => setCreateOpen(true)}
          >
            New Announcement
          </Button>
        ) : undefined
      }
    >
      {/* ── Stats row ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total",
            value: announcements.length,
            bg: "bg-brand-50 dark:bg-brand-950",
            color: "text-brand-600 dark:text-brand-400",
          },
          {
            label: "Unread",
            value: unreadCount,
            bg: "bg-red-50 dark:bg-red-950",
            color: "text-red-500 dark:text-red-400",
          },
          {
            label: "Urgent",
            value: announcements.filter((a) => a.type === "Urgent").length,
            bg: "bg-orange-50 dark:bg-orange-950",
            color: "text-orange-500 dark:text-orange-400",
          },
          {
            label: "Read",
            value: announcements.filter((a) => a.isRead).length,
            bg: "bg-emerald-50 dark:bg-emerald-950",
            color: "text-emerald-600 dark:text-emerald-400",
          },
        ].map(({ label, value, bg, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}
            >
              <Megaphone size={16} className={color} />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {value}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {label}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ── */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-4 mb-4">
        <div className="flex flex-wrap items-center gap-3">
          {/* Type filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Type:
            </span>
            {[
              "All",
              "Information",
              "Tournament",
              "Match",
              "Warning",
              "Urgent",
            ].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterType === t
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200 dark:bg-gray-700" />

          {/* Read filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Status:
            </span>
            {["All", "Unread", "Read"].map((r) => (
              <button
                key={r}
                onClick={() => setFilterRead(r)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  filterRead === r
                    ? "bg-brand-600 text-white"
                    : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── List ── */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Megaphone
                size={26}
                className="text-gray-300 dark:text-gray-600"
              />
            </div>
            <p className="text-gray-500 dark:text-gray-400 font-medium">
              No announcements found
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              {filterType !== "All" || filterRead !== "All"
                ? "Try changing your filters"
                : isAdmin
                  ? "Create your first announcement above"
                  : "Check back later"}
            </p>
          </div>
        ) : (
          filtered.map((a) => <AnnouncementCard key={a.id} announcement={a} />)
        )}
      </div>

      {/* Create modal — admin only */}
      {isAdmin && (
        <CreateAnnouncementModal
          isOpen={createOpen}
          onClose={() => setCreateOpen(false)}
          onSubmit={(values) => createMutation.mutate(values)}
          isLoading={createMutation.isPending}
        />
      )}
    </PageLayout>
  );
}
