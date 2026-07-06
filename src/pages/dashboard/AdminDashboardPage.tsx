import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Users,
  Swords,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Calendar,
  Star,
  Gamepad2,
  Activity,
  Zap,
  Target,
  ChevronRight,
  Medal,
} from "lucide-react";
import {
  adminDashboardApi,
  type PendingAction,
  type TournamentOverview,
  type AdminUpcomingMatch,
  type TopPlayer,
  type RecentActivity,
} from "@/api/adminDashboard";
import { formatDate } from "@/utils";
import PageLayout from "@/components/common/PageLayout";
import Badge from "@/components/common/Badge";
import { useAuth } from "@/hooks/useAuth";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

// ─── Status config ────────────────────────────────────────────────────────────
const statusVariant = (
  status: string,
): "info" | "success" | "warning" | "danger" | "default" => {
  const map: Record<
    string,
    "info" | "success" | "warning" | "danger" | "default"
  > = {
    RegistrationOpen: "success",
    Upcoming: "info",
    Ongoing: "warning",
    Completed: "default",
    Cancelled: "danger",
  };
  return map[status] ?? "default";
};

const activityConfig: Record<
  string,
  { color: string; bg: string; icon: React.ElementType }
> = {
  TournamentWinner: {
    color: "text-amber-600 dark:text-amber-400",
    bg: "bg-amber-50 dark:bg-amber-950",
    icon: Trophy,
  },
  MatchCompleted: {
    color: "text-emerald-600 dark:text-emerald-400",
    bg: "bg-emerald-50 dark:bg-emerald-950",
    icon: CheckCircle2,
  },
  TournamentCreated: {
    color: "text-brand-600 dark:text-brand-400",
    bg: "bg-brand-50 dark:bg-brand-950",
    icon: Zap,
  },
  PlayerJoined: {
    color: "text-purple-600 dark:text-purple-400",
    bg: "bg-purple-50 dark:bg-purple-950",
    icon: Users,
  },
  MatchScheduled: {
    color: "text-blue-600 dark:text-blue-400",
    bg: "bg-blue-50 dark:bg-blue-950",
    icon: Calendar,
  },
};

function getActivity(type: string) {
  return (
    activityConfig[type] ?? {
      color: "text-gray-600 dark:text-gray-400",
      bg: "bg-gray-50 dark:bg-zinc-800/50",
      icon: Activity,
    }
  );
}
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
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

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  trend,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  sub?: string;
  accent?: "brand" | "emerald" | "amber" | "purple" | "red" | "blue";
  trend?: string;
}) {
  const accents = {
    brand: {
      bg: "bg-brand-50 dark:bg-brand-950",
      icon: "text-brand-600 dark:text-brand-400",
      value: "text-brand-700 dark:text-brand-300",
    },
    emerald: {
      bg: "bg-emerald-50 dark:bg-emerald-950",
      icon: "text-emerald-600 dark:text-emerald-400",
      value: "text-emerald-700 dark:text-emerald-300",
    },
    amber: {
      bg: "bg-amber-50 dark:bg-amber-950",
      icon: "text-amber-600 dark:text-amber-400",
      value: "text-amber-700 dark:text-amber-300",
    },
    purple: {
      bg: "bg-purple-50 dark:bg-purple-950",
      icon: "text-purple-600 dark:text-purple-400",
      value: "text-purple-700 dark:text-purple-300",
    },
    red: {
      bg: "bg-red-50 dark:bg-red-950",
      icon: "text-red-500 dark:text-red-400",
      value: "text-red-600 dark:text-red-300",
    },
    blue: {
      bg: "bg-blue-50 dark:bg-blue-950",
      icon: "text-blue-600 dark:text-blue-400",
      value: "text-blue-700 dark:text-blue-300",
    },
  };

  const a = accents[accent ?? "brand"];

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card p-5 flex flex-col gap-3 hover:shadow-card-hover transition-shadow">
      <div className="flex items-center justify-between">
        <div
          className={`w-10 h-10 rounded-xl ${a.bg} flex items-center justify-center`}
        >
          <Icon size={18} className={a.icon} />
        </div>
        {trend && (
          <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-full font-medium">
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className={`text-3xl font-black ${a.value}`}>
          {value.toLocaleString()}
        </p>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mt-0.5">
          {label}
        </p>
        {sub && (
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────
function ProgressBar({
  value,
  color = "bg-brand-500",
}: {
  value: number;
  color?: string;
}) {
  return (
    <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${color}`}
        style={{ width: `${Math.min(value, 100)}%` }}
      />
    </div>
  );
}

// ─── Section wrapper ──────────────────────────────────────────────────────────
function Section({
  title,
  icon: Icon,
  iconColor = "text-gray-500 dark:text-gray-400",
  children,
  action,
}: {
  title: string;
  icon: React.ElementType;
  iconColor?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50 dark:border-zinc-700/50">
        <div className="flex items-center gap-2">
          <Icon size={16} className={iconColor} />
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
            {title}
          </h3>
        </div>
        {action}
      </div>
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {children}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonRow({ cols = 3 }: { cols?: number }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 animate-pulse">
      <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800/50 shrink-0" />
      <div className="flex-1 space-y-1.5">
        <div className="h-3.5 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/2" />
        {cols > 1 && (
          <div className="h-3 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/3" />
        )}
      </div>
      {cols > 2 && (
        <div className="h-4 bg-gray-100 dark:bg-zinc-800/50 rounded w-16" />
      )}
    </div>
  );
}

// ─── Pending Action Row ───────────────────────────────────────────────────────
function PendingActionRow({ action }: { action: PendingAction }) {
  const isWinner = action.actionType === "WinnerPending";
  return (
    <div className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
          isWinner
            ? "bg-amber-50 dark:bg-amber-950"
            : "bg-blue-50 dark:bg-blue-950"
        }`}
      >
        {isWinner ? (
          <Trophy size={14} className="text-amber-500" />
        ) : (
          <Calendar size={14} className="text-blue-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-800 dark:text-gray-200 leading-snug">
          {action.message}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
          {action.tournamentName}
          {action.matchDate && <> · {formatDate(action.matchDate)}</>}
        </p>
      </div>
      <Badge
        variant={isWinner ? "warning" : "info"}
        className="shrink-0 text-[10px]"
      >
        {isWinner ? "Winner" : "Schedule"}
      </Badge>
    </div>
  );
}

// ─── Tournament Overview Row ──────────────────────────────────────────────────
function TournamentOverviewRow({
  t,
  onExport,
  isExporting,
}: {
  t: TournamentOverview;
  onExport: (id: string, name: string) => void;
  isExporting: boolean;
}) {
  const progressColor =
    t.progressPercentage >= 80
      ? "bg-emerald-500"
      : t.progressPercentage >= 40
        ? "bg-brand-500"
        : "bg-amber-500";

  return (
    <div className="px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {t.tournamentName}
          </p>
          <div className="flex items-center gap-2 mt-0.5">
            <Gamepad2 size={11} className="text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t.gameName}
            </span>
            <span className="text-gray-200 dark:text-gray-700">·</span>
            <Users size={11} className="text-gray-400 dark:text-gray-500" />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {t.participants} players
            </span>
          </div>
        </div>
        <Badge
          variant={statusVariant(t.status)}
          className="shrink-0 text-[10px]"
        >
          {t.status}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1">
          <ProgressBar value={t.progressPercentage} color={progressColor} />
        </div>
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400 shrink-0 w-20 text-right">
          {t.completedMatches}/{t.totalMatches} matches
        </span>
        <span className="text-xs font-bold text-gray-600 dark:text-gray-300 shrink-0 w-8 text-right">
          {t.progressPercentage}%
        </span>
      </div>

      <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-400 dark:text-gray-500">
        <Calendar size={10} />
        <span>
          {formatDate(t.startDate)} → {formatDate(t.endDate)}
        </span>
      </div>
      {t.status === "Completed" && (
        <div className="mt-3 pt-3 border-t border-gray-50 dark:border-gray-800">
          <button
            onClick={() => onExport(t.tournamentId, t.tournamentName)}
            disabled={isExporting}
            className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isExporting ? (
              <>
                <Loader2 size={12} className="animate-spin" /> Exporting...
              </>
            ) : (
              <>
                <Download size={12} /> Download Summary
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Upcoming Match Row ───────────────────────────────────────────────────────
function UpcomingMatchRow({ match }: { match: AdminUpcomingMatch }) {
  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0">
        <Swords size={14} className="text-brand-600 dark:text-brand-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {match.player1Name}
          </span>
          <span className="text-xs text-gray-300 dark:text-gray-600 font-bold">
            vs
          </span>
          <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {match.player2Name}
          </span>
        </div>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 truncate">
          {match.tournamentName} · {match.roundName}
        </p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
          {formatDate(match.matchDate)}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500">
          {new Date(match.startTime).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </p>
      </div>
    </div>
  );
}

// ─── Top Player Row ───────────────────────────────────────────────────────────
function TopPlayerRow({ player, rank }: { player: TopPlayer; rank: number }) {
  const rankColors = [
    "text-yellow-500 dark:text-yellow-400",
    "text-slate-400 dark:text-slate-500",
    "text-amber-700 dark:text-amber-500",
  ];

  const rankBgs = [
    "bg-yellow-50 dark:bg-yellow-950/40",
    "bg-slate-50 dark:bg-slate-800/50",
    "bg-amber-50 dark:bg-amber-950/60",
  ];

  return (
    <div className="flex items-center gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      {/* Rank */}
      <div
        className={`w-7 h-7 rounded-lg ${rankBgs[rank - 1] ?? "bg-gray-50 dark:bg-zinc-800/50"} flex items-center justify-center shrink-0`}
      >
        {rank <= 3 ? (
          <Medal size={14} className={rankColors[rank - 1]} />
        ) : (
          <span className="text-xs font-bold text-gray-400 dark:text-gray-500">
            #{rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-bold shrink-0">
        {player.fullName[0].toUpperCase()}
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
          {player.fullName}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {player.wins} wins
          </span>
          {player.championships > 0 && (
            <>
              <span className="text-gray-200 dark:text-gray-700">·</span>
              <span className="text-xs text-amber-500 flex items-center gap-0.5">
                <Trophy size={10} /> {player.championships}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Win rate */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-brand-600 dark:text-brand-400">
          {player.winRate}%
        </p>
        <p className="text-[10px] text-gray-400 dark:text-gray-500">win rate</p>
      </div>
    </div>
  );
}

// ─── Activity Row ─────────────────────────────────────────────────────────────
function ActivityRow({ activity }: { activity: RecentActivity }) {
  const { color, bg, icon: Icon } = getActivity(activity.activityType);

  return (
    <div className="flex items-start gap-3 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
      <div
        className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center shrink-0 mt-0.5`}
      >
        <Icon size={14} className={color} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-700 dark:text-gray-300 leading-snug">
          {activity.message}
        </p>
      </div>
      <span className="text-xs text-gray-400 dark:text-gray-500 shrink-0 mt-0.5">
        {timeAgo(activity.createdAt)}
      </span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function AdminDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [exportingId, setExportingId] = useState<string | null>(null);
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminDashboardApi.getStats().then((r) => r.data.data),
  });

  const { data: pendingActions, isLoading: pendingLoading } = useQuery({
    queryKey: ["admin-pending-actions"],
    queryFn: () =>
      adminDashboardApi.getPendingActions().then((r) => r.data.data),
  });

  const { data: tournamentOverview, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin-tournament-overview"],
    queryFn: () =>
      adminDashboardApi.getTournamentOverview().then((r) => r.data.data),
  });

  const { data: upcomingMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ["admin-upcoming-matches"],
    queryFn: () =>
      adminDashboardApi.getUpcomingMatches().then((r) => r.data.data),
  });

  const { data: topPlayers, isLoading: playersLoading } = useQuery({
    queryKey: ["admin-top-players"],
    queryFn: () => adminDashboardApi.getTopPlayers().then((r) => r.data.data),
  });

  const { data: recentActivities, isLoading: activitiesLoading } = useQuery({
    queryKey: ["admin-recent-activities"],
    queryFn: () =>
      adminDashboardApi.getRecentActivities().then((r) => r.data.data),
  });

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  const matchCompletionRate = stats
    ? Math.round(
        (stats.completedMatches /
          (stats.completedMatches + stats.pendingMatches || 1)) *
          100,
      )
    : 0;
  const handleExport = async (tournamentId: string, tournamentName: string) => {
    try {
      setExportingId(tournamentId);
      const res = await adminDashboardApi.exportTournament(tournamentId);
      const blob = new Blob([res.data], {
        //@ts-ignore
        type:
          res.headers["content-type"] ||
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      downloadBlob(blob, `${tournamentName.replace(/\s+/g, "_")}_Summary.xlsx`);
      toast.success("Export downloaded successfully!");
    } catch {
      toast.error("Failed to export tournament.");
    } finally {
      setExportingId(null);
    }
  };
  return (
    <PageLayout
      heading={`${greeting()}, ${user?.fullName?.split(" ")[0] ?? "Admin"} 👋`}
      subtitle="Here's what's happening across all tournaments today."
    >
      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        {statsLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 p-5 animate-pulse"
            >
              <div className="w-10 h-10 bg-gray-100 dark:bg-zinc-800/50 rounded-xl mb-3" />
              <div className="h-8 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/2 mb-1.5" />
              <div className="h-3.5 bg-gray-100 dark:bg-zinc-800/50 rounded w-3/4" />
            </div>
          ))
        ) : stats ? (
          <>
            <StatCard
              icon={Trophy}
              label="Total Tournaments"
              value={stats.totalTournaments}
              accent="brand"
            />
            <StatCard
              icon={Zap}
              label="Active Tournaments"
              value={stats.activeTournaments}
              accent="amber"
              trend="Live"
            />
            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={stats.completedTournaments}
              accent="emerald"
            />
            <StatCard
              icon={Users}
              label="Total Players"
              value={stats.totalPlayers}
              accent="purple"
            />
            <StatCard
              icon={AlertTriangle}
              label="Pending Matches"
              value={stats.pendingMatches}
              accent="red"
            />
            <StatCard
              icon={Swords}
              label="Matches Done"
              value={stats.completedMatches}
              accent="blue"
            />
          </>
        ) : null}
      </div>

      {/* ── Match completion summary bar ── */}
      {stats && (
        <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Target
                size={15}
                className="text-brand-600 dark:text-brand-400"
              />
              <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Overall Match Completion
              </span>
            </div>
            <span className="text-sm font-bold text-brand-600 dark:text-brand-400">
              {matchCompletionRate}%
            </span>
          </div>
          <ProgressBar value={matchCompletionRate} color="bg-brand-500" />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              {stats.completedMatches} completed
            </span>
            <span className="flex items-center gap-1.5">
              {stats.pendingMatches} pending
              <span className="w-2 h-2 rounded-full bg-gray-200 dark:bg-gray-700 inline-block" />
            </span>
          </div>
        </div>
      )}

      {/* ── Main grid ── */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">
        {/* Pending actions — spans 1 col */}
        <div>
          <Section
            title="Pending Actions"
            icon={AlertTriangle}
            iconColor="text-red-500"
            action={
              pendingActions && pendingActions.length > 0 ? (
                <span className="text-xs bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 px-2 py-0.5 rounded-full font-medium">
                  {pendingActions.length} pending
                </span>
              ) : undefined
            }
          >
            {pendingLoading ? (
              Array.from({ length: 3 }).map((_, i) => <SkeletonRow key={i} />)
            ) : pendingActions?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <CheckCircle2 size={28} className="text-emerald-400 mb-2" />
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                  All caught up!
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                  No pending actions.
                </p>
              </div>
            ) : (
              pendingActions?.map((a) => (
                <PendingActionRow key={a.matchId} action={a} />
              ))
            )}
          </Section>
        </div>

        {/* Tournament overview — spans 2 cols */}
        <div className="xl:col-span-2">
          <Section
            title="Tournament Overview"
            icon={Trophy}
            iconColor="text-brand-600 dark:text-brand-400"
            action={
              <button
                onClick={() => navigate("/tournaments")}
                className="flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 hover:text-brand-700 font-medium transition-colors"
              >
                View all <ChevronRight size={13} />
              </button>
            }
          >
            {overviewLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <SkeletonRow key={i} cols={3} />
              ))
            ) : tournamentOverview?.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <p className="text-sm text-gray-400 dark:text-gray-500">
                  No tournaments found.
                </p>
              </div>
            ) : (
              tournamentOverview?.map((t) => (
                <TournamentOverviewRow
                  key={t.tournamentId}
                  t={t}
                  onExport={handleExport}
                  isExporting={exportingId === t.tournamentId}
                />
              ))
            )}
          </Section>
        </div>
      </div>

      {/* ── Bottom grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming matches */}
        <Section
          title="Upcoming Matches"
          icon={Clock}
          iconColor="text-amber-500"
        >
          {matchesLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <SkeletonRow key={i} cols={3} />
            ))
          ) : upcomingMatches?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No upcoming matches.
              </p>
            </div>
          ) : (
            upcomingMatches?.map((m) => (
              <UpcomingMatchRow key={m.matchId} match={m} />
            ))
          )}
        </Section>

        {/* Top players */}
        <Section title="Top Players" icon={Star} iconColor="text-amber-500">
          {playersLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <SkeletonRow key={i} cols={3} />
            ))
          ) : topPlayers?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No players found.
              </p>
            </div>
          ) : (
            topPlayers?.map((p, i) => (
              <TopPlayerRow key={p.userId} player={p} rank={i + 1} />
            ))
          )}
        </Section>

        {/* Recent activity */}
        <Section
          title="Recent Activity"
          icon={Activity}
          iconColor="text-purple-500 dark:text-purple-400"
        >
          {activitiesLoading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          ) : recentActivities?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10">
              <p className="text-sm text-gray-400 dark:text-gray-500">
                No recent activity.
              </p>
            </div>
          ) : (
            recentActivities?.map((a, i) => (
              <ActivityRow key={i} activity={a} />
            ))
          )}
        </Section>
      </div>
    </PageLayout>
  );
}
