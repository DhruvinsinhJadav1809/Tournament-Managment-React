import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  Trophy,
  Users,
  Calendar,
  Gamepad2,
  ChevronRight,
  UserPlus,
  Clock,
  Swords,
  CheckCircle2,
  Star,
  Eye,
  Flame,
  BarChart3,
  Target,
  CalendarClock,
  Download,
} from "lucide-react";
import {
  dashboardApi,
  type OngoingTournament,
  type MyTournamentItem,
  UpcomingMatch,
} from "@/api/dashboard";
import { matchesApi, type TournamentBracket } from "@/api/matches";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/utils";
import PageLayout from "@/components/common/PageLayout";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import TournamentBracketModal from "@/pages/tournaments/TournamentBracketModal";
import { tournamentsApi } from "@/api/tournaments";

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<
  string,
  {
    label: string;
    variant: "info" | "success" | "warning" | "danger" | "default";
    color: string;
    bg: string;
  }
> = {
  RegistrationOpen: {
    label: "Registration Open",
    variant: "success",
    color: "bg-emerald-500",
    bg: "bg-emerald-50",
  },
  Upcoming: {
    label: "Upcoming",
    variant: "info",
    color: "bg-brand-500",
    bg: "bg-brand-50",
  },
  Ongoing: {
    label: "Ongoing",
    variant: "warning",
    color: "bg-amber-500",
    bg: "bg-amber-50",
  },
  Completed: {
    label: "Completed",
    variant: "default",
    color: "bg-gray-400",
    bg: "bg-gray-50",
  },
  Cancelled: {
    label: "Cancelled",
    variant: "danger",
    color: "bg-red-500",
    bg: "bg-red-50",
  },
  RegistrationClosed: {
    label: "Reg. Closed",
    variant: "default",
    color: "bg-gray-400",
    bg: "bg-gray-50",
  },
};

function getStatus(key: string) {
  return (
    statusConfig[key] ?? {
      label: key,
      variant: "default" as const,
      color: "bg-gray-400",
      bg: "bg-gray-50",
    }
  );
}

// ─── Participant progress bar ─────────────────────────────────────────────────
function ParticipantBar({ current, max }: { current: number; max: number }) {
  const pct = max > 0 ? Math.round((current / max) * 100) : 0;
  const color =
    pct >= 90 ? "bg-red-500" : pct >= 60 ? "bg-amber-500" : "bg-brand-500";
  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1.5">
        <span>{current} joined</span>
        <span>{max} spots</span>
      </div>
      <div className="w-full h-1.5 bg-gray-100 dark:bg-zinc-800/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent = false,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-5 flex items-center gap-4 ${
        accent
          ? "bg-brand-600 border-brand-700 text-white"
          : "bg-white dark:bg-zinc-800/50 border-gray-100 dark:border-zinc-700/50 shadow-card"
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
          accent ? "bg-white/20" : "bg-brand-50 dark:bg-brand-950"
        }`}
      >
        <Icon
          size={20}
          className={
            accent ? "text-white" : "text-brand-600 dark:text-brand-400"
          }
        />
      </div>
      <div>
        <p
          className={`text-xs mb-0.5 ${accent ? "text-brand-200" : "text-gray-500 dark:text-gray-400"}`}
        >
          {label}
        </p>
        <p
          className={`text-xl font-bold ${accent ? "text-white" : "text-gray-900 dark:text-gray-100"}`}
        >
          {value}
        </p>
        {sub && (
          <p
            className={`text-xs ${accent ? "text-brand-200" : "text-gray-400 dark:text-gray-500"}`}
          >
            {sub}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Tournament Detail Modal ──────────────────────────────────────────────────
function TournamentDetailModal({
  tournamentId,
  isOpen,
  onClose,
}: {
  tournamentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["tournament-detail", tournamentId],
    queryFn: () =>
      dashboardApi.getTournamentById(tournamentId!).then((r) => r.data.data),
    enabled: !!tournamentId && isOpen,
  });

  const status = data ? getStatus(data.statusName) : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tournament Details"
      subtitle={data?.name}
      size="md"
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 py-3 border-b border-gray-50 dark:border-zinc-700/50"
            >
              <div className="w-8 h-8 bg-gray-100 dark:bg-zinc-800/50 rounded-lg" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/4" />
                <div className="h-4 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : data ? (
        <div>
          {status && (
            <div className="flex items-center gap-2 rounded-xl px-4 py-3 mb-5 bg-gray-50 dark:bg-zinc-800/50">
              <div className={`w-2 h-2 rounded-full ${status.color}`} />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {status.label}
              </span>
              {data.isActive && (
                <span className="ml-auto text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active
                </span>
              )}
            </div>
          )}
          <div className="divide-y divide-gray-50 dark:divide-gray-800">
            {[
              { icon: Trophy, label: "Tournament", value: data.name },
              { icon: Gamepad2, label: "Game", value: data.gameName },
              { icon: Swords, label: "Type", value: data.tournamentType },
              {
                icon: Users,
                label: "Max Spots",
                value: String(data.maxParticipants),
              },
              {
                icon: Calendar,
                label: "Starts",
                value: formatDate(data.startDate),
              },
              {
                icon: Calendar,
                label: "Ends",
                value: formatDate(data.endDate),
              },
              ...(data.registrationStartDate
                ? [
                    {
                      icon: Clock,
                      label: "Reg. Opens",
                      value: formatDate(data.registrationStartDate),
                    },
                  ]
                : []),
              ...(data.registrationEndDate
                ? [
                    {
                      icon: Clock,
                      label: "Reg. Closes",
                      value: formatDate(data.registrationEndDate),
                    },
                  ]
                : []),
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-start gap-3 py-3">
                <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center shrink-0">
                  <Icon
                    size={15}
                    className="text-brand-600 dark:text-brand-400"
                  />
                </div>
                <div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">
                    {label}
                  </p>
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    {value}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-center py-8 text-gray-400 dark:text-gray-500 text-sm">
          Failed to load details.
        </p>
      )}
    </Modal>
  );
}

// ─── Available Tournament Card ────────────────────────────────────────────────
function AvailableTournamentCard({
  tournament,
  onJoin,
  onViewDetails,
  isJoining,
  isAlreadyJoined,
}: {
  tournament: OngoingTournament;
  onJoin: (id: string) => void;
  onViewDetails: (id: string) => void;
  isJoining: boolean;
  isAlreadyJoined: boolean;
}) {
  const status = getStatus(tournament.status);
  const spotsLeft = tournament.maxParticipants - tournament.currentParticipants;
  const isFull = spotsLeft <= 0;
  const canJoin =
    tournament.status === "RegistrationOpen" && !isFull && !isAlreadyJoined;

  return (
    <div className="group bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex flex-col">
      <div className={`h-1 w-full ${status.color}`} />
      <div className="p-5 flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm leading-snug truncate">
              {tournament.name}
            </h3>
            <div className="flex items-center gap-1.5 mt-1">
              <Gamepad2
                size={12}
                className="text-gray-400 dark:text-gray-500 shrink-0"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {tournament.gameName}
              </span>
              <span className="text-gray-200 dark:text-gray-700">·</span>
              <Swords
                size={12}
                className="text-gray-400 dark:text-gray-500 shrink-0"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {tournament.tournamentType}
              </span>
            </div>
          </div>
          <Badge variant={status.variant} className="shrink-0 text-xs">
            {status.label}
          </Badge>
        </div>

        {/* Info */}
        <div className="space-y-1.5 mb-3">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <Calendar
              size={12}
              className="text-gray-400 dark:text-gray-500 shrink-0"
            />
            <span>Starts {formatDate(tournament.startDate)}</span>
          </div>
          {tournament.registrationEndDate && (
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <Clock
                size={12}
                className="text-gray-400 dark:text-gray-500 shrink-0"
              />
              <span>
                Reg. closes {formatDate(tournament.registrationEndDate)}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-xs">
            <Users
              size={12}
              className="text-gray-400 dark:text-gray-500 shrink-0"
            />
            {isFull ? (
              <span className="text-red-500 font-medium">Tournament full</span>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {spotsLeft}
                </span>{" "}
                spots left
              </span>
            )}
          </div>
        </div>

        <div className="mb-4">
          <ParticipantBar
            current={tournament.currentParticipants}
            max={tournament.maxParticipants}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto">
          <Button
            variant={canJoin ? "primary" : "secondary"}
            size="sm"
            className="flex-1"
            leftIcon={
              isAlreadyJoined ? (
                <CheckCircle2 size={13} />
              ) : (
                <UserPlus size={13} />
              )
            }
            onClick={() => canJoin && onJoin(tournament.id)}
            disabled={!canJoin}
            isLoading={isJoining}
          >
            {isAlreadyJoined
              ? "Joined"
              : isFull
                ? "Full"
                : tournament.status !== "RegistrationOpen"
                  ? "Not open"
                  : "Participate"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            rightIcon={<ChevronRight size={13} />}
            onClick={() => onViewDetails(tournament.id)}
          >
            Details
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── My Tournament Card ───────────────────────────────────────────────────────
function MyTournamentCard({
  item,
  onViewMatches,
  isLoadingBracket,
}: {
  item: MyTournamentItem;
  onViewMatches: (id: string) => void;
  isLoadingBracket: boolean;
}) {
  const status = getStatus(item.status);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const onDownloadCertificate = async (tournamentId: string) => {
    try {
      setIsLoading(true);
      const response =
        await tournamentsApi.downloadWinnerCertificate(tournamentId);

      const blob = new Blob([response.data], {
        type: "application/pdf",
      });

      const url = window.URL.createObjectURL(blob);

      const link = document.createElement("a");

      link.href = url;

      link.download = `WinnerCertificate.pdf`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

      toast.success("Certificate downloaded successfully.");
    } catch (error) {
      console.error(error);

      toast.error("Failed to download certificate.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div
      className={`relative rounded-2xl border overflow-hidden transition-all duration-200 ${
        item.isChampion
          ? "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950"
          : "border-gray-100 dark:border-zinc-700/50 bg-white dark:bg-zinc-800/50 shadow-card hover:shadow-card-hover"
      }`}
    >
      {item.isChampion && (
        <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 dark:from-amber-600 dark:to-yellow-500">
          <Star size={13} className="text-white fill-white" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            Champion
          </span>
          <Star size={13} className="text-white fill-white ml-auto" />
        </div>
      )}

      <div className={`h-1 w-full ${status.color}`} />

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              {item.isChampion && (
                <Trophy size={14} className="text-amber-500 shrink-0" />
              )}
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-sm truncate">
                {item.tournamentName}
              </h3>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <Gamepad2
                size={11}
                className="text-gray-400 dark:text-gray-500"
              />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {item.gameName}
              </span>
            </div>
          </div>
          <Badge variant={status.variant} className="shrink-0 text-xs">
            {status.label}
          </Badge>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <Calendar size={11} className="text-gray-400 dark:text-gray-500" />
          <span>
            {formatDate(item.startDate)} → {formatDate(item.endDate)}
          </span>
        </div>

        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-2 mb-3 text-xs ${
            item.isGeneratedMatches
              ? "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400"
              : "bg-gray-50 dark:bg-zinc-800/50 text-gray-500 dark:text-gray-400"
          }`}
        >
          {item.isGeneratedMatches ? (
            <>
              <CheckCircle2 size={12} /> Matches scheduled
            </>
          ) : (
            <>
              <Clock size={12} /> Matches not yet scheduled
            </>
          )}
        </div>

        {item.isGeneratedMatches && (
          <Button
            variant={item.isChampion ? "primary" : "outline"}
            size="sm"
            className="w-full"
            leftIcon={<Eye size={13} />}
            onClick={() => onViewMatches(item.tournamentId)}
            isLoading={isLoadingBracket}
          >
            View My Matches
          </Button>
        )}
        {item.isChampion && (
          <Button
            variant={"outline"}
            size="sm"
            className="w-full mt-4 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 transition-colors py-2"
            leftIcon={<Download size={13} className="text-blue-600" />}
            onClick={() => onDownloadCertificate(item.tournamentId)}
            isLoading={isLoading}
          >
            Download Certificate
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Skeleton cards ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-4 bg-gray-100 dark:bg-zinc-800/50 rounded w-2/3" />
        <div className="h-4 bg-gray-100 dark:bg-zinc-800/50 rounded w-16" />
      </div>
      <div className="space-y-2 mb-3">
        <div className="h-3 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/2" />
        <div className="h-3 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/3" />
      </div>
      <div className="h-1.5 bg-gray-100 dark:bg-zinc-800/50 rounded mb-4" />
      <div className="flex gap-2">
        <div className="h-8 bg-gray-100 dark:bg-zinc-800/50 rounded-xl flex-1" />
        <div className="h-8 bg-gray-100 dark:bg-zinc-800/50 rounded-xl w-24" />
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({
  icon: Icon,
  title,
  count,
  color = "text-gray-700 dark:text-gray-300",
}: {
  icon: React.ElementType;
  title: string;
  count: number;
  color?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className={color} />
        <h2
          className={`text-sm font-semibold uppercase tracking-wider ${color}`}
        >
          {title}
        </h2>
      </div>
      <div className="flex-1 h-px bg-gray-100 dark:bg-zinc-800/50" />
      <span className="text-xs text-gray-400 dark:text-gray-500 bg-gray-100 dark:bg-zinc-800/50 rounded-full px-2.5 py-0.5">
        {count}
      </span>
    </div>
  );
}

// ─── Summary chart ────────────────────────────────────────────────────────────
function MyTournamentSummary({
  active,
  completed,
  champion,
}: {
  active: number;
  completed: number;
  champion: number;
}) {
  const total = active + completed;
  if (total === 0) return null;

  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={16} className="text-brand-600 dark:text-brand-400" />
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          My Tournament Summary
        </h3>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-amber-50 dark:bg-amber-950 border border-amber-100 dark:border-amber-900">
          <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center mb-2">
            <Trophy size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <span className="text-2xl font-bold text-amber-700 dark:text-amber-400">
            {champion}
          </span>
          <span className="text-xs text-amber-600 dark:text-amber-500 mt-0.5 text-center">
            Championships
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-brand-50 dark:bg-brand-950 border border-brand-100 dark:border-brand-900">
          <div className="w-10 h-10 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center mb-2">
            <Flame size={18} className="text-brand-600 dark:text-brand-400" />
          </div>
          <span className="text-2xl font-bold text-brand-700 dark:text-brand-400">
            {active}
          </span>
          <span className="text-xs text-brand-600 dark:text-brand-500 mt-0.5 text-center">
            Active Now
          </span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-gray-700">
          <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
            <Target size={18} className="text-gray-500 dark:text-gray-400" />
          </div>
          <span className="text-2xl font-bold text-gray-700 dark:text-gray-300">
            {completed}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 text-center">
            Completed
          </span>
        </div>
      </div>

      {total > 0 && (
        <div className="mt-4">
          <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mb-1.5">
            <span>Tournament progress</span>
            <span>{Math.round((completed / total) * 100)}% completed</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-zinc-800/50 rounded-full overflow-hidden flex">
            <div
              className="h-full bg-brand-500 transition-all duration-700"
              style={{ width: `${(active / total) * 100}%` }}
            />
            <div
              className="h-full bg-gray-300 dark:bg-gray-600 transition-all duration-700"
              style={{ width: `${(completed / total) * 100}%` }}
            />
          </div>
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-400 dark:text-gray-500">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
              Active
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
              Completed
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: React.ElementType;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center mb-3">
        <Icon size={24} className="text-gray-300 dark:text-gray-600" />
      </div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
        {title}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
        {subtitle}
      </p>
    </div>
  );
}

// ─── Match status config ──────────────────────────────────────────────────────
const matchStatusConfig: Record<
  string,
  {
    label: string;
    variant: "info" | "success" | "warning" | "danger" | "default";
    dot: string;
  }
> = {
  Ready: { label: "Ready", variant: "info", dot: "bg-brand-500" },
  Scheduled: { label: "Scheduled", variant: "warning", dot: "bg-amber-500" },
  Completed: { label: "Completed", variant: "success", dot: "bg-emerald-500" },
  Cancelled: { label: "Cancelled", variant: "danger", dot: "bg-red-500" },
};

function getMatchStatus(key: string) {
  return (
    matchStatusConfig[key] ?? {
      label: key,
      variant: "default" as const,
      dot: "bg-gray-400",
    }
  );
}

// ─── Upcoming Matches Section ─────────────────────────────────────────────────
function UpcomingMatchesSection({
  matches,
  isLoading,
}: {
  matches: UpcomingMatch[];
  isLoading: boolean;
}) {
  if (!isLoading && matches.length === 0) return null;

  return (
    <div className="mb-8">
      <SectionHeader
        icon={Swords}
        title="My Upcoming Matches"
        count={matches.length}
        color="text-purple-600 dark:text-purple-400"
      />

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 p-4 animate-pulse"
            >
              <div className="flex justify-between mb-3">
                <div className="h-4 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/2" />
                <div className="h-4 bg-gray-100 dark:bg-zinc-800/50 rounded w-16" />
              </div>
              <div className="h-12 bg-gray-100 dark:bg-zinc-800/50 rounded-xl mb-3" />
              <div className="h-3 bg-gray-100 dark:bg-zinc-800/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {matches.map((match) => {
            const status = getMatchStatus(match.status);
            const hasSchedule = !!match.matchDate;

            return (
              <div
                key={match.matchId}
                className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden"
              >
                <div className={`h-1 w-full ${status.dot}`} />

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="min-w-0">
                      <p className="text-xs text-gray-400 dark:text-gray-300 truncate">
                        {match.tournamentName}
                      </p>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {match.roundName}
                      </p>
                    </div>
                    <Badge
                      variant={status.variant}
                      className="shrink-0 text-xs"
                    >
                      {status.label}
                    </Badge>
                  </div>

                  {/* VS card */}
                  <div className="flex items-center gap-3 bg-gray-50 dark:bg-zinc-800 rounded-xl px-4 py-3 mb-3">
                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-bold">
                        Me
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                        You
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="flex items-center justify-center w-7 h-7 rounded-full bg-white dark:bg-gray-700 border border-gray-100 dark:border-gray-600 shadow-sm">
                        <Swords
                          size={12}
                          className="text-gray-400 dark:text-gray-500"
                        />
                      </div>
                      <span className="text-[9px] font-bold text-gray-300 dark:text-gray-600 tracking-widest">
                        VS
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-1 flex-1">
                      <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 text-xs font-bold">
                        {match.opponentName[0].toUpperCase()}
                      </div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center truncate max-w-[70px]">
                        {match.opponentName}
                      </span>
                    </div>
                  </div>

                  {hasSchedule ? (
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 bg-amber-50 dark:bg-amber-950 rounded-lg px-3 py-2">
                      <Clock size={12} className="text-amber-500 shrink-0" />
                      <span>
                        {formatDate(match.matchDate!)}
                        {match.startTime && (
                          <>
                            {" · "}
                            {new Date(match.startTime).toLocaleTimeString(
                              "en-IN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                              },
                            )}
                            {match.endTime && (
                              <>
                                {" "}
                                {" – "}
                                {new Date(match.endTime).toLocaleTimeString(
                                  "en-IN",
                                  {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    hour12: true,
                                  },
                                )}
                              </>
                            )}
                          </>
                        )}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-zinc-800/50 rounded-lg px-3 py-2">
                      <CalendarClock
                        size={12}
                        className="text-gray-400 dark:text-gray-500 shrink-0"
                      />
                      <span>Schedule not set yet</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function UserDashboardPage() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [joiningId, setJoiningId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [bracket, setBracket] = useState<TournamentBracket | null>(null);
  const [bracketOpen, setBracketOpen] = useState(false);
  const [loadingBracketId, setLoadingBracketId] = useState<string | null>(null);

  const { data: availableData, isLoading: availableLoading } = useQuery({
    queryKey: ["ongoing-tournaments"],
    queryFn: () => dashboardApi.getOngoingTournaments().then((r) => r.data),
  });

  const { data: myData, isLoading: myLoading } = useQuery({
    queryKey: ["my-tournaments"],
    queryFn: () => dashboardApi.getMyTournaments().then((r) => r.data.data),
  });

  const { data: upcomingMatches, isLoading: matchesLoading } = useQuery({
    queryKey: ["upcoming-matches"],
    queryFn: () => dashboardApi.getUpcomingMatches().then((r) => r.data),
  });

  const joinMutation = useMutation({
    mutationFn: (id: string) => dashboardApi.joinTournament(id),
    onMutate: (id) => setJoiningId(id),
    onSuccess: (res) => {
      const msg = (res.data as { message?: string })?.message;
      toast.success(msg || "Successfully joined the tournament!");
      qc.invalidateQueries({ queryKey: ["ongoing-tournaments"] });
      qc.invalidateQueries({ queryKey: ["my-tournaments"] });
    },
    onError: (error: unknown) => {
      const axiosErr = error as { response?: { data?: { message?: string } } };
      toast.error(
        axiosErr?.response?.data?.message || "Failed to join tournament.",
      );
    },
    onSettled: () => setJoiningId(null),
  });

  const viewBracketMutation = useMutation({
    mutationFn: (id: string) =>
      matchesApi.getBracket(id).then((r) => r.data.data),
    onMutate: (id) => setLoadingBracketId(id),
    onSuccess: (data) => {
      setBracket(data);
      setBracketOpen(true);
      qc.setQueryData(["bracket", data.tournamentId], data);
    },
    onError: () => toast.error("Failed to load bracket."),
    onSettled: () => setLoadingBracketId(null),
  });

  const matches = upcomingMatches?.data || [];
  const available = availableData?.data || [];
  const myActive = myData?.activeTournaments || [];
  const myCompleted = myData?.completedTournaments || [];
  const myAll = [...myActive, ...myCompleted];
  const champions = myAll.filter((t) => t.isChampion).length;
  const joinedIds = new Set(myAll.map((t) => t.tournamentId));

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <PageLayout
      heading={`${greeting()}, ${user?.fullName?.split(" ")[0] ?? "there"} 👋`}
      subtitle="Track your tournaments and discover new ones to join."
    >
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Trophy}
          label="My Tournaments"
          value={myLoading ? "—" : myAll.length}
          sub="total joined"
          accent
        />
        <StatCard
          icon={Star}
          label="Championships"
          value={myLoading ? "—" : champions}
          sub="titles won"
        />
        <StatCard
          icon={Flame}
          label="Active Now"
          value={myLoading ? "—" : myActive.length}
          sub="in progress"
        />
        <StatCard
          icon={Target}
          label="Available"
          value={availableLoading ? "—" : available.length}
          sub="open to join"
        />
      </div>

      {!myLoading && myAll.length > 0 && (
        <MyTournamentSummary
          active={myActive.length}
          completed={myCompleted.length}
          champion={champions}
        />
      )}

      <UpcomingMatchesSection matches={matches} isLoading={matchesLoading} />

      {!myLoading && myActive.length > 0 && (
        <div className="mb-8">
          <SectionHeader
            icon={Flame}
            title="My Active Tournaments"
            count={myActive.length}
            color="text-amber-600 dark:text-amber-400"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {myActive.map((t) => (
              <MyTournamentCard
                key={t.tournamentId}
                item={t}
                onViewMatches={(id) => viewBracketMutation.mutate(id)}
                isLoadingBracket={
                  loadingBracketId === t.tournamentId &&
                  viewBracketMutation.isPending
                }
              />
            ))}
          </div>
        </div>
      )}

      {!myLoading && myCompleted.length > 0 && (
        <div className="mb-8">
          <SectionHeader
            icon={CheckCircle2}
            title="Completed Tournaments"
            count={myCompleted.length}
            color="text-gray-500 dark:text-gray-400"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {myCompleted.map((t) => (
              <MyTournamentCard
                key={t.tournamentId}
                item={t}
                onViewMatches={(id) => viewBracketMutation.mutate(id)}
                isLoadingBracket={
                  loadingBracketId === t.tournamentId &&
                  viewBracketMutation.isPending
                }
              />
            ))}
          </div>
        </div>
      )}

      {!myLoading && myAll.length === 0 && (
        <div className="mb-8 bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card">
          <EmptyState
            icon={Trophy}
            title="No tournaments joined yet"
            subtitle="Browse available tournaments below and hit Participate to join."
          />
        </div>
      )}

      <div>
        <SectionHeader
          icon={Swords}
          title="Available Tournaments"
          count={available.length}
          color="text-brand-600 dark:text-brand-400"
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {availableLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          ) : available.length === 0 ? (
            <EmptyState
              icon={Swords}
              title="No tournaments available"
              subtitle="Check back later for new ones."
            />
          ) : (
            available.map((t) => (
              <AvailableTournamentCard
                key={t.id}
                tournament={t}
                onJoin={(id) => joinMutation.mutate(id)}
                onViewDetails={(id) => {
                  setDetailId(id);
                  setDetailOpen(true);
                }}
                isJoining={joiningId === t.id && joinMutation.isPending}
                isAlreadyJoined={joinedIds.has(t.id)}
              />
            ))
          )}
        </div>
      </div>

      <TournamentDetailModal
        tournamentId={detailId}
        isOpen={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setDetailId(null);
        }}
      />

      <TournamentBracketModal
        bracket={bracket}
        isOpen={bracketOpen}
        onClose={() => {
          setBracketOpen(false);
          setBracket(null);
        }}
        onBracketUpdate={(updated) => setBracket(updated)}
      />
    </PageLayout>
  );
}
