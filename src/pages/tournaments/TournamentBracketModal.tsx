import { Clock, Trophy, Swords, CheckCircle2, Timer } from "lucide-react";
import Modal from "@/components/common/Modal";
import Badge from "@/components/common/Badge";
import { TournamentBracket, Match, matchesApi } from "@/api/matches";
import { formatDate } from "@/utils";
import { useState } from "react";
import toast from "react-hot-toast";
import MatchResultModal from "./MatchResultModal";
import { useAuth } from "@/hooks/useAuth";
import ScheduleMatchModal from "./ScheduleMatchModal";
import { CalendarClock } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// ─── Status config ────────────────────────────────────────────────────────────
const matchStatusVariant = (
  status: string,
): "info" | "success" | "warning" | "danger" | "default" => {
  const map: Record<
    string,
    "info" | "success" | "warning" | "danger" | "default"
  > = {
    Pending: "default",
    InProgress: "warning",
    Completed: "success",
    Cancelled: "danger",
  };
  return map[status] ?? "default";
};

// ─── Single match card ────────────────────────────────────────────────────────
function MatchCard({
  match,
  onUpdateResult,
  onSchedule,
}: {
  match: Match;
  onUpdateResult?: (match: Match) => void;
  onSchedule?: (match: Match) => void;
}) {
  const isBye = match.isBye;
  const isCompleted = match.status === "Completed";
  const isPending = !match.player1Name && !match.player2Name;
  const { isAdmin } = useAuth();

  return (
    <div className="bg-white dark:bg-zinc-800/50 border border-gray-100 dark:border-zinc-700/50 rounded-xl shadow-sm overflow-hidden min-w-[220px]">
      {/* Match header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-100 dark:border-gray-700">
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Match #{match.matchNumber}
        </span>
        <Badge variant={matchStatusVariant(match.status)}>
          {isBye ? "Bye" : match.status}
        </Badge>
      </div>

      {/* Players */}
      <div className="divide-y divide-gray-50 dark:divide-gray-800">
        {/* Player 1 */}
        <div
          className={`flex items-center gap-2.5 px-3 py-2.5 ${
            isCompleted && match.winnerId === match.player1Id
              ? "bg-emerald-50 dark:bg-emerald-950"
              : ""
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isPending
                ? "bg-gray-100 dark:bg-zinc-800/50 text-gray-300 dark:text-gray-600"
                : "bg-brand-100 dark:bg-brand-900 text-brand-700 dark:text-brand-300"
            }`}
          >
            {match.player1Name ? match.player1Name[0].toUpperCase() : "?"}
          </div>
          <span
            className={`text-sm font-medium truncate flex-1 ${
              isPending
                ? "text-gray-300 dark:text-gray-600 italic"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {match.player1Name ?? "TBD"}
          </span>

          {isCompleted &&
            match.player1Score !== undefined &&
            match.player1Score !== null && (
              <span
                className={`text-sm font-bold w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  match.winnerId === match.player1Id
                    ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                    : "bg-gray-100 dark:bg-zinc-800/50 text-gray-400 dark:text-gray-500"
                }`}
              >
                {match.player1Score}
              </span>
            )}

          {match.winnerId === match.player1Id && (
            <Trophy size={13} className="text-amber-500 shrink-0" />
          )}
        </div>

        {/* VS divider */}
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-50/50 dark:bg-zinc-800">
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
          <span className="text-[10px] font-bold text-gray-300 dark:text-gray-600 tracking-widest">
            VS
          </span>
          <div className="flex-1 h-px bg-gray-100 dark:bg-gray-700" />
        </div>

        {/* Player 2 */}
        <div
          className={`flex items-center gap-2.5 px-3 py-2.5 ${
            isCompleted && match.winnerId === match.player2Id
              ? "bg-emerald-50 dark:bg-emerald-950"
              : ""
          }`}
        >
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
              isPending
                ? "bg-gray-100 dark:bg-zinc-800/50 text-gray-300 dark:text-gray-600"
                : "bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300"
            }`}
          >
            {match.player2Name ? match.player2Name[0].toUpperCase() : "?"}
          </div>
          <span
            className={`text-sm font-medium truncate flex-1 ${
              isPending
                ? "text-gray-300 dark:text-gray-600 italic"
                : "text-gray-800 dark:text-gray-200"
            }`}
          >
            {match.player2Name ?? "TBD"}
          </span>

          {isCompleted &&
            match.player2Score !== undefined &&
            match.player2Score !== null && (
              <span
                className={`text-sm font-bold w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  match.winnerId === match.player2Id
                    ? "bg-emerald-100 dark:bg-emerald-900 text-emerald-700 dark:text-emerald-300"
                    : "bg-gray-100 dark:bg-zinc-800/50 text-gray-400 dark:text-gray-500"
                }`}
              >
                {match.player2Score}
              </span>
            )}

          {match.winnerId === match.player2Id && (
            <Trophy size={13} className="text-amber-500 shrink-0" />
          )}
        </div>
      </div>

      {/* Match time */}
      {match.startTime && (
        <div className="flex items-center gap-1.5 px-3 py-2 border-t border-gray-50 dark:border-zinc-700/50 bg-gray-50/50 dark:bg-zinc-800/50">
          <Clock size={11} className="text-gray-400 dark:text-gray-500" />
          <span className="text-xs text-gray-400 dark:text-gray-500">
            {formatDate(match.matchDate!)} ·{" "}
            {new Date(match.startTime).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
            {match.endTime && (
              <>
                {" "}
                {" – "}
                {new Date(match.endTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </>
            )}
          </span>
        </div>
      )}

      {/* Schedule button */}
      {isAdmin &&
        match.player1Id &&
        match.player2Id &&
        !match.matchDate &&
        match.status !== "Completed" &&
        onUpdateResult && (
          <button
            onClick={() => onSchedule?.(match)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950 border-t border-gray-100 dark:border-zinc-700/50 transition-colors"
          >
            <CalendarClock size={12} />
            Set Match Date
          </button>
        )}

      {/* Set Result button */}
      {isAdmin &&
        match.player1Id &&
        match.player2Id &&
        !!match.matchDate &&
        match.status !== "Completed" &&
        onUpdateResult && (
          <button
            onClick={() => onUpdateResult(match)}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-950 border-t border-gray-100 dark:border-zinc-700/50 transition-colors"
          >
            <Trophy size={12} />
            Set Result
          </button>
        )}

      {/* Completed */}
      {isAdmin && match.status === "Completed" && match.winnerId && (
        <div className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs border-t border-gray-100 dark:border-zinc-700/50 bg-emerald-50/50 dark:bg-emerald-950/50">
          <CheckCircle2 size={12} className="text-emerald-500" />
          <span className="text-emerald-600 dark:text-emerald-400 font-medium">
            Result recorded
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Round column ─────────────────────────────────────────────────────────────
function RoundColumn({
  round,
  isLast,
  onUpdateResult,
  onSchedule,
}: {
  round: { roundNumber: number; roundName: string; matches: Match[] };
  isLast: boolean;
  onUpdateResult: (match: Match) => void;
  onSchedule: (match: Match) => void;
}) {
  return (
    <div className="flex flex-col items-center gap-3 min-w-[240px]">
      <div
        className={`w-full text-center py-2 px-4 rounded-xl text-sm font-semibold ${
          isLast
            ? "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800"
            : "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 border border-brand-100 dark:border-brand-900"
        }`}
      >
        {isLast && <Trophy size={13} className="inline mr-1.5 mb-0.5" />}
        {round.roundName}
        <span className="ml-1.5 text-xs font-normal opacity-60">
          ({round.matches.length}{" "}
          {round.matches.length === 1 ? "match" : "matches"})
        </span>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {round.matches.map((match) => (
          <MatchCard
            key={match.matchId}
            match={match}
            onUpdateResult={onUpdateResult}
            onSchedule={onSchedule}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Stats bar ────────────────────────────────────────────────────────────────
function BracketStats({ bracket }: { bracket: TournamentBracket }) {
  const allMatches = bracket.rounds.flatMap((r) => r.matches);
  const completed = allMatches.filter((m) => m.status === "Completed").length;
  const pending = allMatches.filter((m) => m.status === "Pending").length;
  const inProgress = allMatches.filter((m) => m.status === "InProgress").length;

  return (
    <div className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-zinc-800/50 rounded-xl mb-5 text-xs flex-wrap">
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
        <Swords size={13} className="text-brand-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {allMatches.length}
        </span>{" "}
        total matches
      </div>
      <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
        <CheckCircle2 size={13} className="text-emerald-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {completed}
        </span>{" "}
        completed
      </div>
      <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
        <Timer size={13} className="text-amber-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {inProgress}
        </span>{" "}
        in progress
      </div>
      <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />
      <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
        <Clock size={13} className="text-gray-400 dark:text-gray-500" />
        <span className="font-medium text-gray-700 dark:text-gray-300">
          {pending}
        </span>{" "}
        pending
      </div>
    </div>
  );
}

// ─── Main modal ───────────────────────────────────────────────────────────────
export default function TournamentBracketModal({
  bracket,
  isOpen,
  onClose,
  onBracketUpdate,
}: {
  bracket: TournamentBracket | null;
  isOpen: boolean;
  onClose: () => void;
  onBracketUpdate: (updated: TournamentBracket) => void;
}) {
  const qc = useQueryClient();
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [scheduleMatch, setScheduleMatch] = useState<Match | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const refetchBracket = async () => {
    if (!bracket?.tournamentId) return;
    try {
      const res = await matchesApi.getBracket(bracket.tournamentId);
      onBracketUpdate(res.data.data);
    } catch {
      // silent — local update already applied
    }
  };

  const scheduleMutation = useMutation({
    mutationFn: ({
      matchId,
      ...payload
    }: { matchId: string } & Parameters<typeof matchesApi.scheduleMatch>[1]) =>
      matchesApi.scheduleMatch(matchId, payload),
    onSuccess: (_, variables) => {
      toast.success("Match scheduled!");
      setScheduleOpen(false);
      setScheduleMatch(null);
      qc.invalidateQueries({ queryKey: ["bracket", bracket?.tournamentId] });
      if (bracket) {
        const updated: TournamentBracket = {
          ...bracket,
          rounds: bracket.rounds.map((r) => ({
            ...r,
            matches: r.matches.map((m) =>
              m.matchId === variables.matchId
                ? {
                    ...m,
                    matchDate: variables.matchDate,
                    startTime: variables.startTime,
                    endTime: variables.endTime,
                  }
                : m,
            ),
          })),
        };
        onBracketUpdate(updated);
        refetchBracket();
      }
    },
    onError: () => toast.error("Failed to schedule match"),
  });

  const resultMutation = useMutation({
    mutationFn: ({
      matchId,
      ...payload
    }: { matchId: string } & Parameters<
      typeof matchesApi.updateMatchResult
    >[1]) => matchesApi.updateMatchResult(matchId, payload),
    onSuccess: (_, variables) => {
      toast.success("Match result updated!");
      setResultOpen(false);
      setSelectedMatch(null);
      qc.invalidateQueries({ queryKey: ["bracket", bracket?.tournamentId] });
      if (bracket) {
        const updated: TournamentBracket = {
          ...bracket,
          rounds: bracket.rounds.map((r) => ({
            ...r,
            matches: r.matches.map((m) =>
              m.matchId === variables.matchId
                ? {
                    ...m,
                    status: "Completed",
                    winnerId: variables.winnerId,
                    player1Score: variables.player1Score,
                    player2Score: variables.player2Score,
                  }
                : m,
            ),
          })),
        };
        onBracketUpdate(updated);
        refetchBracket();
      }
    },
    onError: () => toast.error("Failed to update result"),
  });

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Tournament Bracket"
        subtitle={bracket?.tournamentName}
        size="lg"
      >
        {!bracket ? null : (
          <div>
            <BracketStats bracket={bracket} />
            <div className="overflow-x-auto pb-2">
              <div className="flex gap-6 items-start min-w-max">
                {bracket.rounds.map((round, i) => (
                  <div key={round.roundId} className="flex items-start gap-6">
                    <RoundColumn
                      round={round}
                      isLast={i === bracket.rounds.length - 1}
                      onUpdateResult={(match) => {
                        setSelectedMatch(match);
                        setResultOpen(true);
                      }}
                      onSchedule={(match) => {
                        setScheduleMatch(match);
                        setScheduleOpen(true);
                      }}
                    />
                    {i < bracket.rounds.length - 1 && (
                      <div className="flex items-center self-center mt-8">
                        <div className="w-6 h-px bg-gray-200 dark:bg-gray-700" />
                        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[7px] border-l-gray-300 dark:border-l-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <MatchResultModal
        key={selectedMatch?.matchId}
        match={selectedMatch}
        isOpen={resultOpen}
        onClose={() => {
          setResultOpen(false);
          setSelectedMatch(null);
        }}
        isLoading={resultMutation.isPending}
        onSubmit={(matchId, payload) =>
          resultMutation.mutate({ matchId, ...payload })
        }
      />

      <ScheduleMatchModal
        key={scheduleMatch?.matchId}
        match={scheduleMatch}
        isOpen={scheduleOpen}
        onClose={() => {
          setScheduleOpen(false);
          setScheduleMatch(null);
        }}
        isLoading={scheduleMutation.isPending}
        onSubmit={(matchId, payload) =>
          scheduleMutation.mutate({ matchId, ...payload })
        }
      />
    </>
  );
}
