import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Calendar,
  dateFnsLocalizer,
  type Event,
  type View,
  Views,
} from "react-big-calendar";
import { format, parse, startOfWeek, getDay } from "date-fns";
import { enIN } from "date-fns/locale";
// @ts-ignore
import "react-big-calendar/lib/css/react-big-calendar.css";
import {
  Trophy,
  Swords,
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
} from "lucide-react";
import { scheduleApi, type ScheduleMatch } from "@/api/schedule";
import { useAuth } from "@/hooks/useAuth";
import { formatDate } from "@/utils";
import PageLayout from "@/components/common/PageLayout";
import Modal from "@/components/common/Modal";
import Badge from "@/components/common/Badge";

// ─── date-fns localizer ───────────────────────────────────────────────────────
const locales = { "en-IN": enIN };

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
});

// ─── Event interface ──────────────────────────────────────────────────────────
interface CalendarEvent extends Event {
  resource: ScheduleMatch;
}

// ─── Tournament color map ─────────────────────────────────────────────────────
const COLORS = [
  { bg: "#4a5ef7", light: "#eef0fe" },
  { bg: "#10b981", light: "#ecfdf5" },
  { bg: "#f59e0b", light: "#fffbeb" },
  { bg: "#8b5cf6", light: "#f5f3ff" },
  { bg: "#ef4444", light: "#fef2f2" },
  { bg: "#06b6d4", light: "#ecfeff" },
  { bg: "#f97316", light: "#fff7ed" },
  { bg: "#ec4899", light: "#fdf2f8" },
];

// ─── Custom toolbar ───────────────────────────────────────────────────────────
function CustomToolbar({
  date,
  onNavigate,
  onView,
  view,
}: {
  date: Date;
  onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
  onView: (view: View) => void;
  view: View;
}) {
  const views: { key: View; label: string }[] = [
    { key: Views.MONTH, label: "Month" },
    { key: Views.WEEK, label: "Week" },
    { key: Views.DAY, label: "Day" },
  ];

  const label = format(
    date,
    view === Views.MONTH
      ? "MMMM yyyy"
      : view === Views.WEEK
        ? "'Week of' dd MMM yyyy"
        : "EEEE, dd MMM yyyy",
  );

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onNavigate("PREV")}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => onNavigate("TODAY")}
          className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Today
        </button>
        <button
          onClick={() => onNavigate("NEXT")}
          className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 ml-1">
          {label}
        </span>
      </div>

      {/* View switcher */}
      <div className="flex items-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl">
        {views.map((v) => (
          <button
            key={v.key}
            onClick={() => onView(v.key as View)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              view === v.key
                ? "bg-white dark:bg-gray-900 text-brand-600 dark:text-brand-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            {v.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Event detail modal ───────────────────────────────────────────────────────
function EventDetailModal({
  event,
  isOpen,
  onClose,
}: {
  event: CalendarEvent | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!event) return null;
  const match = event.resource;

  const hasTime = !!match.startTime;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Match Details" size="sm">
      <div className="space-y-4">
        {/* Tournament */}
        <div className="flex items-start gap-3 p-3 bg-brand-50 dark:bg-brand-950 rounded-xl">
          <Trophy
            size={16}
            className="text-brand-600 dark:text-brand-400 mt-0.5 shrink-0"
          />
          <div>
            <p className="text-xs text-brand-500 dark:text-brand-400 mb-0.5">
              Tournament
            </p>
            <p className="text-sm font-semibold text-brand-700 dark:text-brand-300">
              {match.tournamentName}
            </p>
          </div>
        </div>

        {/* Round */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
            <LayoutGrid
              size={14}
              className="text-gray-500 dark:text-gray-400"
            />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Round</p>
            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
              {match.roundName}
            </p>
          </div>
        </div>

        {/* Players */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
            <Swords size={14} className="text-gray-500 dark:text-gray-400" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500">Match</p>
            {match.opponentName ? (
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                You vs{" "}
                <span className="font-semibold">{match.opponentName}</span>
              </p>
            ) : (
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                <span className="font-semibold">{match.player1Name}</span>
                <span className="text-gray-400 dark:text-gray-500 mx-1.5">
                  vs
                </span>
                <span className="font-semibold">{match.player2Name}</span>
              </p>
            )}
          </div>
        </div>

        {/* Date & Time */}
        {hasTime && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <Clock size={14} className="text-gray-500 dark:text-gray-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                Date & Time
              </p>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                {formatDate(match.matchDate)}
                {" · "}
                {new Date(match.startTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                })}
                {match.endTime && (
                  <>
                    {" – "}
                    {new Date(match.endTime).toLocaleTimeString("en-IN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </>
                )}
              </p>
            </div>
          </div>
        )}

        {/* Status */}
        {match.status && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800 flex items-center justify-center shrink-0">
              <CalendarIcon
                size={14}
                className="text-gray-500 dark:text-gray-400"
              />
            </div>
            <div>
              <p className="text-xs text-gray-400 dark:text-gray-500">Status</p>
              <Badge
                variant={match.status === "Scheduled" ? "warning" : "info"}
              >
                {match.status}
              </Badge>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function SchedulePage() {
  const { isAdmin } = useAuth();
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null,
  );
  const [modalOpen, setModalOpen] = useState(false);
  const [currentView, setCurrentView] = useState<View>(Views.MONTH);

  const { data, isLoading } = useQuery({
    queryKey: ["schedule-matches", isAdmin],
    queryFn: () =>
      isAdmin
        ? scheduleApi.getAdminSchedule().then((r) => r.data.data)
        : scheduleApi.getUserSchedule().then((r) => r.data.data),
  });

  // Build color map per tournament
  const tournamentColorMap = useMemo(() => {
    const map = new Map<string, (typeof COLORS)[0]>();
    let idx = 0;
    data?.forEach((m) => {
      if (!map.has(m.tournamentId)) {
        map.set(m.tournamentId, COLORS[idx % COLORS.length]);
        idx++;
      }
    });
    return map;
  }, [data]);

  // Convert matches to calendar events
  const events: CalendarEvent[] = useMemo(() => {
    if (!data) return [];
    return data
      .filter((m) => !!m.startTime)
      .map((m) => ({
        title: m.opponentName
          ? `vs ${m.opponentName}`
          : `${m.player1Name} vs ${m.player2Name}`,
        start: new Date(m.startTime),
        end: m.endTime
          ? new Date(m.endTime)
          : new Date(new Date(m.startTime).getTime() + 30 * 60000),
        resource: m,
      }));
  }, [data]);

  // Color per event
  const eventStyleGetter = (event: CalendarEvent) => {
    const color =
      tournamentColorMap.get(event.resource.tournamentId) ?? COLORS[0];
    return {
      style: {
        backgroundColor: color.bg,
        borderRadius: "8px",
        border: "none",
        color: "#fff",
        fontSize: "12px",
        fontWeight: "500",
        padding: "2px 6px",
      },
    };
  };

  // Legend
  const legend = useMemo(() => {
    const seen = new Set<string>();
    return (data ?? [])
      .filter((m) => {
        if (seen.has(m.tournamentId)) return false;
        seen.add(m.tournamentId);
        return true;
      })
      .map((m) => ({
        tournamentId: m.tournamentId,
        tournamentName: m.tournamentName,
        color: tournamentColorMap.get(m.tournamentId)?.bg ?? "#4a5ef7",
      }));
  }, [data, tournamentColorMap]);

  return (
    <PageLayout
      heading="Match Schedule"
      subtitle={
        isAdmin
          ? "All upcoming matches across tournaments"
          : "Your upcoming match schedule"
      }
    >
      {/* Legend */}
      {legend.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            Tournaments:
          </span>
          {legend.map((l) => (
            <div key={l.tournamentId} className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: l.color }}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {l.tournamentName}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Calendar card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-5">
        {isLoading ? (
          <div className="h-[600px] flex items-center justify-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Loading schedule...
              </p>
            </div>
          </div>
        ) : (
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            view={currentView}
            onView={(v) => setCurrentView(v)}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => {
              setSelectedEvent(event as CalendarEvent);
              setModalOpen(true);
            }}
            components={{
              toolbar: (props) => (
                <CustomToolbar
                  date={props.date}
                  onNavigate={(action) => props.onNavigate(action)}
                  onView={(v: View) => setCurrentView(v)}
                  view={currentView}
                />
              ),
            }}
            popup
            showMultiDayTimes
          />
        )}
      </div>

      {/* Empty state */}
      {!isLoading && events.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-center mt-4">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 dark:bg-gray-800 flex items-center justify-center mb-4">
            <CalendarIcon
              size={26}
              className="text-gray-300 dark:text-gray-600"
            />
          </div>
          <p className="text-gray-500 dark:text-gray-400 font-medium">
            No scheduled matches
          </p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
            Matches will appear here once they are scheduled.
          </p>
        </div>
      )}

      <EventDetailModal
        event={selectedEvent}
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEvent(null);
        }}
      />
    </PageLayout>
  );
}
