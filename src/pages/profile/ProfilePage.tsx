import { useQuery } from "@tanstack/react-query";
import {
  Trophy,
  Mail,
  Shield,
  Swords,
  TrendingUp,
  Target,
  CheckCircle2,
  Flame,
  Calendar,
  Star,
  User,
} from "lucide-react";
import { profileApi, type RecentMatch } from "@/api/profile";
import { formatDate } from "@/utils";
import PageLayout from "@/components/common/PageLayout";
import Badge from "@/components/common/Badge";
import { useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import toast from "react-hot-toast";

// ─── Win rate ring (SVG) ──────────────────────────────────────────────────────
function WinRateRing({ rate }: { rate: number }) {
  const size = 120;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const circumference = 2 * Math.PI * r;
  const offset = circumference - (rate / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center">
      <svg width={size} height={size} className="-rotate-90">
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-gray-100 dark:text-gray-800"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-brand-500 transition-all duration-700"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          {rate}%
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Win Rate
        </span>
      </div>
    </div>
  );
}

// ─── W/L bar chart (pure CSS) ────────────────────────────────────────────────
function WinLossBar({ wins, losses }: { wins: number; losses: number }) {
  const total = wins + losses;
  if (total === 0) return null;
  const winPct = Math.round((wins / total) * 100);
  const lossPct = 100 - winPct;

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
          Wins ({wins})
        </span>
        <span className="flex items-center gap-1.5">
          Losses ({losses})
          <span className="w-2 h-2 rounded-full bg-red-400 inline-block" />
        </span>
      </div>
      <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800/50 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-emerald-500 transition-all duration-700 rounded-l-full"
          style={{ width: `${winPct}%` }}
        />
        <div
          className="h-full bg-red-400 transition-all duration-700 rounded-r-full"
          style={{ width: `${lossPct}%` }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 dark:text-gray-500 mt-1.5">
        <span>{winPct}%</span>
        <span>{lossPct}%</span>
      </div>
    </div>
  );
}

// ─── Tournaments breakdown bar ────────────────────────────────────────────────
function TournamentBar({
  active,
  completed,
}: {
  active: number;
  completed: number;
}) {
  const total = active + completed;
  if (total === 0) return null;
  const activePct = Math.round((active / total) * 100);

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-brand-500 inline-block" />
          Active ({active})
        </span>
        <span className="flex items-center gap-1.5">
          Completed ({completed})
          <span className="w-2 h-2 rounded-full bg-gray-400 inline-block" />
        </span>
      </div>
      <div className="w-full h-3 bg-gray-100 dark:bg-zinc-800/50 rounded-full overflow-hidden flex">
        <div
          className="h-full bg-brand-500 transition-all duration-700 rounded-l-full"
          style={{ width: `${activePct}%` }}
        />
        <div
          className="h-full bg-gray-400 dark:bg-gray-600 transition-all duration-700 rounded-r-full"
          style={{ width: `${100 - activePct}%` }}
        />
      </div>
    </div>
  );
}

// ─── Stat box ─────────────────────────────────────────────────────────────────
function StatBox({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 border border-gray-100 dark:border-gray-700 gap-2">
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}
      >
        <Icon size={18} className="text-white" />
      </div>
      <span className="text-xl font-bold text-gray-900 dark:text-gray-100">
        {value}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400 text-center">
        {label}
      </span>
    </div>
  );
}

// ─── Recent match row ─────────────────────────────────────────────────────────
function MatchRow({ match }: { match: RecentMatch }) {
  const isWon = match.result === "Won";
  const isDraw = match.result === "Draw";

  return (
    <div className="flex items-center gap-4 py-3 border-b border-gray-50 dark:border-zinc-700/50 last:border-0">
      {/* Result indicator */}
      <div
        className={`w-1 h-10 rounded-full shrink-0 ${
          isWon ? "bg-emerald-500" : isDraw ? "bg-amber-500" : "bg-red-400"
        }`}
      />

      {/* Opponent avatar */}
      <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center text-purple-700 dark:text-purple-300 text-xs font-bold shrink-0">
        {match.opponentName[0].toUpperCase()}
      </div>

      {/* Match info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
          vs {match.opponentName}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
          {match.tournamentName}
        </p>
      </div>

      {/* Score */}
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
          {match.score}
        </p>
        <p
          className={`text-xs font-medium ${
            isWon
              ? "text-emerald-600 dark:text-emerald-400"
              : isDraw
                ? "text-amber-600 dark:text-amber-400"
                : "text-red-500 dark:text-red-400"
          }`}
        >
          {match.result}
        </p>
      </div>

      {/* Date */}
      <div className="text-xs text-gray-400 dark:text-gray-500 shrink-0 hidden sm:block">
        {formatDate(match.matchDate)}
      </div>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function ProfileSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 p-6 flex gap-6">
        <div className="w-24 h-24 rounded-2xl bg-gray-100 dark:bg-zinc-800/50 shrink-0" />
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/3" />
          <div className="h-4 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/4" />
          <div className="h-4 bg-gray-100 dark:bg-zinc-800/50 rounded w-1/5" />
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="h-24 bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50"
          />
        ))}
      </div>
    </div>
  );
}

// ─── Avatar Upload ────────────────────────────────────────────────────────────
function AvatarUpload({
  initials,
  hasProfileImage,
}: {
  initials: string;
  hasProfileImage: boolean;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);

  // Fetch blob image only if hasProfileImage is true
  const { data: imageUrl } = useQuery({
    queryKey: ["profile-image"],
    queryFn: async () => {
      const res = await profileApi.getProfileImage();
      // convert blob to object URL
      return URL.createObjectURL(res.data);
    },
    enabled: hasProfileImage,
    // clean up object URL on unmount to avoid memory leak
    gcTime: 0,
  });

  const uploadMutation = useMutation({
    mutationFn: (file: File) => {
      if (!user?.id) throw new Error("User not found");
      return profileApi.uploadProfileImage(user.id, file);
    },
    onSuccess: () => {
      toast.success("Profile image updated!");
      // invalidate both — profile for hasProfileImage flag, image for new blob
      qc.invalidateQueries({ queryKey: ["my-profile"] });
      qc.invalidateQueries({ queryKey: ["profile-image"] });
    },
    onError: () => toast.error("Failed to upload image."),
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB.");
      return;
    }

    uploadMutation.mutate(file);
    e.target.value = "";
  };

  return (
    <div
      className="relative w-24 h-24 shrink-0 group cursor-pointer"
      onClick={() => !uploadMutation.isPending && fileRef.current?.click()}
    >
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Avatar — show fetched blob image or initials */}
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Profile"
          className="w-24 h-24 rounded-2xl object-cover border-2 border-brand-100 dark:border-brand-900"
        />
      ) : (
        <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-brand-200 dark:shadow-brand-900">
          {initials}
        </div>
      )}

      {/* Loading overlay */}
      {uploadMutation.isPending && (
        <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center">
          <Loader2 size={24} className="text-white animate-spin" />
        </div>
      )}

      {/* Hover overlay */}
      {!uploadMutation.isPending && (
        <div className="absolute inset-0 rounded-2xl bg-black/0 group-hover:bg-black/40 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center gap-1">
            <Camera size={20} className="text-white" />
            <span className="text-white text-[10px] font-medium">Change</span>
          </div>
        </div>
      )}

      {/* Camera badge */}
      {!uploadMutation.isPending && (
        <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 bg-brand-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 shadow-sm">
          <Camera size={12} className="text-white" />
        </div>
      )}
    </div>
  );
}
// ─── Main page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { data, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => profileApi.getMyProfile().then((r) => r.data.data),
  });

  if (isLoading) {
    return (
      <PageLayout heading="My Profile" subtitle="Your stats and match history">
        <ProfileSkeleton />
      </PageLayout>
    );
  }

  if (!data) {
    return (
      <PageLayout heading="My Profile" subtitle="Your stats and match history">
        <div className="text-center py-20 text-gray-400 dark:text-gray-500">
          Failed to load profile.
        </div>
      </PageLayout>
    );
  }

  const initials = data.fullName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  const totalTournaments = data.activeTournaments + data.completedTournaments;

  return (
    <PageLayout
      heading="My Profile"
      subtitle="Your stats, performance and match history"
    >
      {/* ── Profile hero card ── */}
      <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card p-6 mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <AvatarUpload
            initials={initials}
            hasProfileImage={data.hasProfileImage}
          />

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {data.fullName}
              </h2>
              {data.championships > 0 && (
                <div className="flex items-center gap-1 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 text-xs font-semibold px-2.5 py-1 rounded-full border border-amber-200 dark:border-amber-800">
                  <Trophy size={12} />
                  {data.championships}x Champion
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
              <span className="flex items-center gap-1.5">
                <Mail size={13} className="text-gray-400 dark:text-gray-500" />
                {data.email}
              </span>
              <span className="flex items-center gap-1.5">
                <Shield
                  size={13}
                  className="text-gray-400 dark:text-gray-500"
                />
                <Badge variant={data.role === "Admin" ? "info" : "default"}>
                  {data.role}
                </Badge>
              </span>
            </div>
          </div>

          {/* Win rate ring */}
          <div className="shrink-0">
            <WinRateRing rate={data.winRate} />
          </div>
        </div>
      </div>

      {/* ── Stats grid ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <StatBox
          icon={Swords}
          label="Matches Played"
          value={data.matchesPlayed}
          color="bg-brand-500"
        />
        <StatBox
          icon={CheckCircle2}
          label="Wins"
          value={data.wins}
          color="bg-emerald-500"
        />
        <StatBox
          icon={Target}
          label="Losses"
          value={data.losses}
          color="bg-red-400"
        />
        <StatBox
          icon={Trophy}
          label="Championships"
          value={data.championships}
          color="bg-amber-500"
        />
        <StatBox
          icon={Flame}
          label="Active Tourns."
          value={data.activeTournaments}
          color="bg-orange-500"
        />
        <StatBox
          icon={Star}
          label="Completed Tourns."
          value={data.completedTournaments}
          color="bg-purple-500"
        />
        <StatBox
          icon={TrendingUp}
          label="Win Rate"
          value={`${data.winRate}%`}
          color="bg-teal-500"
        />
        <StatBox
          icon={Calendar}
          label="Total Tourns."
          value={totalTournaments}
          color="bg-gray-500"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Win/Loss breakdown */}
        <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950 flex items-center justify-center">
              <TrendingUp
                size={15}
                className="text-emerald-600 dark:text-emerald-400"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Win / Loss Breakdown
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {data.matchesPlayed} matches total
              </p>
            </div>
          </div>

          {/* Big numbers */}
          <div className="flex items-end gap-6 mb-5">
            <div>
              <p className="text-4xl font-black text-emerald-500">
                {data.wins}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Wins
              </p>
            </div>
            <div className="text-2xl font-bold text-gray-200 dark:text-gray-700 mb-1">
              :
            </div>
            <div>
              <p className="text-4xl font-black text-red-400">{data.losses}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Losses
              </p>
            </div>
          </div>

          <WinLossBar wins={data.wins} losses={data.losses} />
        </div>

        {/* Tournament breakdown */}
        <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card p-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 dark:bg-brand-950 flex items-center justify-center">
              <Trophy
                size={15}
                className="text-brand-600 dark:text-brand-400"
              />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Tournament Breakdown
              </h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {totalTournaments} tournaments total
              </p>
            </div>
          </div>

          {/* Big numbers */}
          <div className="flex items-end gap-6 mb-5">
            <div>
              <p className="text-4xl font-black text-brand-500">
                {data.activeTournaments}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Active
              </p>
            </div>
            <div className="text-2xl font-bold text-gray-200 dark:text-gray-700 mb-1">
              +
            </div>
            <div>
              <p className="text-4xl font-black text-gray-400 dark:text-gray-500">
                {data.completedTournaments}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                Completed
              </p>
            </div>
          </div>

          <TournamentBar
            active={data.activeTournaments}
            completed={data.completedTournaments}
          />
        </div>
      </div>

      {/* ── Performance highlights ── */}
      {data.championships > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-950 dark:to-yellow-950 rounded-2xl border border-amber-200 dark:border-amber-800 p-5 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center shrink-0">
              <Trophy
                size={22}
                className="text-amber-600 dark:text-amber-400"
              />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-800 dark:text-amber-300">
                🏆 {data.championships} Tournament{" "}
                {data.championships === 1 ? "Championship" : "Championships"}{" "}
                Won!
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                You're in the top tier of players. Keep dominating!
              </p>
            </div>
            <div className="ml-auto flex gap-1">
              {Array.from({ length: Math.min(data.championships, 5) }).map(
                (_, i) => (
                  <Star
                    key={i}
                    size={16}
                    className="text-amber-400 fill-amber-400"
                  />
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Recent matches ── */}
      <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 shadow-card p-5">
        <div className="flex items-center gap-2 mb-5">
          <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950 flex items-center justify-center">
            <Swords
              size={15}
              className="text-purple-600 dark:text-purple-400"
            />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              Recent Matches
            </h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              Your last {data.recentMatches.length} matches
            </p>
          </div>
        </div>

        {data.recentMatches.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-50 dark:bg-zinc-800/50 flex items-center justify-center mb-3">
              <User size={20} className="text-gray-300 dark:text-gray-600" />
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No matches played yet
            </p>
          </div>
        ) : (
          <div>
            {/* Summary badges */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <span className="text-xs bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 px-2.5 py-1 rounded-full font-medium border border-emerald-100 dark:border-emerald-900">
                {data.recentMatches.filter((m) => m.result === "Won").length}{" "}
                Won
              </span>
              <span className="text-xs bg-red-50 dark:bg-red-950 text-red-600 dark:text-red-400 px-2.5 py-1 rounded-full font-medium border border-red-100 dark:border-red-900">
                {data.recentMatches.filter((m) => m.result === "Lost").length}{" "}
                Lost
              </span>
              {data.recentMatches.some((m) => m.result === "Draw") && (
                <span className="text-xs bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400 px-2.5 py-1 rounded-full font-medium border border-amber-100 dark:border-amber-900">
                  {data.recentMatches.filter((m) => m.result === "Draw").length}{" "}
                  Draw
                </span>
              )}
            </div>

            {data.recentMatches.map((match) => (
              <MatchRow key={match.matchId} match={match} />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
