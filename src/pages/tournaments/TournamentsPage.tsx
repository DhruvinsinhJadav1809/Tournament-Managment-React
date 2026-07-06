import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { tournamentsApi } from "@/api/tournaments";
import { gamesApi } from "@/api/games";
import type { Tournament, TournamentFilters } from "@/types";
import { formatDate } from "@/utils";
import PageLayout from "@/components/common/PageLayout";
import Table from "@/components/common/Table";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";
import Badge from "@/components/common/Badge";
import Modal from "@/components/common/Modal";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Pagination from "@/components/common/Pagination";
import { Users } from "lucide-react";
import {
  tournamentParticipantsApi,
  type TournamentParticipant,
} from "@/api/tournamentParticipants";
import { Zap, Eye } from "lucide-react";
import {
  GenerateMatchesPayload,
  matchesApi,
  type TournamentBracket,
} from "@/api/matches";
import GenerateMatchesModal from "./GenerateMatchesModal";
import TournamentBracketModal from "./TournamentBracketModal";

const TOURNAMENT_TYPES = ["Singles", "Doubles", "Team"];
const STATUS_OPTIONS = [
  { value: "", label: "All" },
  { value: "upcoming", label: "Upcoming" },
  { value: "registrationopen", label: "Registration Ongoing" },
  { value: "registrationclosed", label: "Registration Closed" },
  { value: "ongoing", label: "Ongoing" },
  { value: "completed", label: "Completed" },
];

const statusVariant = (name: string) => {
  const map: Record<
    string,
    "info" | "success" | "default" | "danger" | "warning"
  > = {
    Upcoming: "info",
    Ongoing: "warning",
    Completed: "success",
    Cancelled: "danger",
  };
  return map[name] ?? "default";
};

const tournamentSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Name is required")
    .min(2, "Minimum 2 characters"),
  gameId: Yup.string().required("Game is required"),
  tournamentType: Yup.string().required("Tournament type is required"),
  maxParticipants: Yup.number()
    .required("Max participants required")
    .min(2, "Minimum 2"),
  startDate: Yup.string()
    .required("Start date is required")
    .test(
      "start-before-end",
      "Start date must be before end date",
      function (val) {
        const { endDate } = this.parent;
        return !endDate || !val || new Date(val) <= new Date(endDate);
      },
    ),
  endDate: Yup.string()
    .required("End date is required")
    .test("after-start", "End date must be after start date", function (val) {
      const { startDate } = this.parent;
      return !startDate || !val || new Date(val) >= new Date(startDate);
    }),
  registrationStartDate: Yup.string()
    .required("Registration start date is required")
    .test(
      "reg-start-before-reg-end",
      "Registration start date must be before registration end date",
      function (val) {
        const { registrationEndDate } = this.parent;
        return (
          !registrationEndDate ||
          !val ||
          new Date(val) <= new Date(registrationEndDate)
        );
      },
    ),
  registrationEndDate: Yup.string()
    .required("Registration end date is required")
    .test(
      "reg-end-before-start",
      "Registration end date must be before start date",
      function (val) {
        const { startDate } = this.parent;
        return !startDate || !val || new Date(val) <= new Date(startDate);
      },
    )
    .test(
      "reg-end-after-reg-start",
      "Registration end date must be after registration start date",
      function (val) {
        const { registrationStartDate } = this.parent;
        return (
          !registrationStartDate ||
          !val ||
          new Date(val) >= new Date(registrationStartDate)
        );
      },
    ),
  isActive: Yup.boolean().required(),
});

const initialFilters: TournamentFilters = {
  page: 1,
  pageSize: 10,
  search: "",
  isActive: "",
  gameId: "",
  status: "",
  startDate: "",
  endDate: "",
};

// ADD this component above TournamentsPage
function ParticipantsModal({
  tournament,
  isOpen,
  onClose,
}: {
  tournament: Tournament | null;
  isOpen: boolean;
  onClose: () => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: ["tournament-participants", tournament?.id],
    queryFn: () =>
      tournamentParticipantsApi
        .getParticipants(tournament!.id)
        .then((r) => r.data.data),
    enabled: !!tournament?.id && isOpen,
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Participants"
      subtitle={`${data?.tournamentName ?? tournament?.name} · ${data?.currentParticipants ?? 0} / ${data?.maxParticipants ?? 0} joined`}
      size="md"
    >
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
            >
              <div className="w-9 h-9 rounded-full bg-gray-200 shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-gray-200 rounded w-1/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
              <div className="h-3 bg-gray-200 rounded w-20" />
            </div>
          ))}
        </div>
      ) : !data?.participants.length ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mb-3">
            <Users size={22} className="text-gray-300" />
          </div>
          <p className="text-sm font-medium text-gray-500">
            No participants yet
          </p>
          <p className="text-xs text-gray-400 mt-1">
            No one has joined this tournament.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {data.participants.map((p: TournamentParticipant, index: number) => (
            <div
              key={p.userId}
              className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold shrink-0">
                {p.fullName
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2)}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {p.fullName}
                </p>
                <p className="text-xs text-gray-400 truncate">{p.email}</p>
              </div>

              {/* Joined date + serial */}
              <div className="text-right shrink-0">
                <p className="text-xs text-gray-500">
                  {formatDate(p.joinedAt)}
                </p>
                <p className="text-xs text-gray-300">#{index + 1}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

export default function TournamentsPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<TournamentFilters>(initialFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<Tournament | null>(null);
  const [deleteItem, setDeleteItem] = useState<Tournament | null>(null);
  const [participantsTournament, setParticipantsTournament] =
    useState<Tournament | null>(null);
  const [participantsOpen, setParticipantsOpen] = useState(false);
  const [generateTournament, setGenerateTournament] =
    useState<Tournament | null>(null);
  const [bracket, setBracket] = useState<TournamentBracket | null>(null);
  const [bracketOpen, setBracketOpen] = useState(false);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["tournaments", filters],
    queryFn: () => tournamentsApi.getAll(filters).then((r) => r.data.data),
  });

  const { data: allGames } = useQuery({
    queryKey: ["games"],
    queryFn: () => gamesApi.getAllNoPagination().then((r) => r.data.data),
    staleTime: Infinity,
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["tournaments"] });

  const createMutation = useMutation({
    mutationFn: tournamentsApi.create,
    onSuccess: () => {
      toast.success("Tournament created");
      invalidate();
      closeModal();
    },
    onError: () => toast.error("Failed to create tournament"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Parameters<typeof tournamentsApi.update>[1]) =>
      tournamentsApi.update(id, payload),
    onSuccess: () => {
      toast.success("Tournament updated");
      invalidate();
      closeModal();
    },
    onError: () => toast.error("Failed to update tournament"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => tournamentsApi.delete(id),
    onSuccess: () => {
      toast.success("Tournament deleted");
      invalidate();
      setDeleteItem(null);
    },
    onError: () => toast.error("Failed to delete tournament"),
  });
  const generateMutation = useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & GenerateMatchesPayload) =>
      matchesApi.generateMatches(id, payload),
    onSuccess: () => {
      toast.success("Matches generated successfully!");
      setGenerateTournament(null);
    },
    onError: () => toast.error("Failed to generate matches"),
  });
  const viewBracketMutation = useMutation({
    mutationFn: (tournamentId: string) =>
      matchesApi.getBracket(tournamentId).then((r) => r.data.data),
    onSuccess: (data) => {
      setBracket(data);
      setBracketOpen(true);
      qc.setQueryData(["bracket", data.tournamentId], data);
    },
    onError: () => toast.error("No bracket found for this tournament."),
  });
  const formik = useFormik({
    initialValues: {
      name: editItem?.name || "",
      gameId: editItem?.gameId || "",
      tournamentType: editItem?.tournamentType || "Singles",
      maxParticipants: editItem?.maxParticipants || 8,
      startDate: editItem?.startDate ? editItem.startDate.slice(0, 10) : "",
      endDate: editItem?.endDate ? editItem.endDate.slice(0, 10) : "",
      isActive: editItem?.isActive ?? true,
      registrationStartDate: editItem?.registrationStartDate
        ? editItem.registrationStartDate.slice(0, 10)
        : "",
      registrationEndDate: editItem?.registrationEndDate
        ? editItem.registrationEndDate.slice(0, 10)
        : "",
      participantsPerEntry: 1,
    },
    enableReinitialize: true,
    validationSchema: tournamentSchema,
    onSubmit: (values) => {
      if (editItem) {
        updateMutation.mutate({ id: editItem.id, ...values });
      } else {
        createMutation.mutate(values);
      }
    },
  });

  const openCreate = () => {
    setEditItem(null);
    setModalOpen(true);
  };
  const openEdit = (t: Tournament) => {
    setEditItem(t);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditItem(null);
    formik.resetForm();
  };

  const setFilter = (key: keyof TournamentFilters, value: unknown) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const gameOptions = (allGames || []).map((g) => ({
    value: g.id,
    label: g.name,
  }));

  const columns = [
    {
      key: "name",
      header: "Tournament",
      render: (t: Tournament) => (
        <div>
          <button
            onClick={() => {
              setParticipantsTournament(t);
              setParticipantsOpen(true);
            }}
            className="font-medium text-gray-900 dark:text-gray-100 hover:text-brand-600 hover:underline underline-offset-2 transition-colors text-left"
          >
            {t.name}
          </button>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-xs text-gray-500">{t.tournamentType}</p>
            {t.currentParticipants !== undefined && (
              <>
                <span className="text-gray-200">·</span>
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <Users size={11} />
                  {t.currentParticipants}
                </span>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      key: "game",
      header: "Game",
      render: (t: Tournament) => <span>{t.gameName}</span>,
    },
    {
      key: "participants",
      header: "Max Participants",
      render: (t: Tournament) => t.maxParticipants,
    },
    {
      key: "registration-dates",
      header: "Registration Dates",
      render: (t: Tournament) => (
        <div className="text-xs text-gray-500 space-y-0.5">
          <p>From: {formatDate(t.registrationStartDate)}</p>
          <p>To: {formatDate(t.registrationEndDate)}</p>
        </div>
      ),
    },
    {
      key: "dates",
      header: "Dates",
      render: (t: Tournament) => (
        <div className="text-xs text-gray-500 space-y-0.5">
          <p>From: {formatDate(t.startDate)}</p>
          <p>To: {formatDate(t.endDate)}</p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (t: Tournament) => (
        <Badge variant={statusVariant(t.statusName)}>{t.statusName}</Badge>
      ),
    },
    {
      key: "active",
      header: "Active",
      render: (t: Tournament) => (
        <Badge variant={t.isActive ? "success" : "default"}>
          {t.isActive ? "Yes" : "No"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (t: Tournament) => (
        <div className="flex flex-col items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Pencil size={14} />}
            onClick={() => openEdit(t)}
          >
            Edit
          </Button>
          {!t.isGeneratedMatches ? (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Zap size={14} />}
              onClick={() => setGenerateTournament(t)}
              className="text-brand-600 hover:text-brand-700 hover:bg-brand-50"
            >
              Generate
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Eye size={14} />}
              onClick={() => viewBracketMutation.mutate(t.id)}
              isLoading={
                viewBracketMutation.isPending &&
                viewBracketMutation.variables === t.id
              }
              className="text-purple-600 dark:text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              Bracket
            </Button>
          )}
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={() => setDeleteItem(t)}
            className="text-red-500 dark:text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            Delete
          </Button>
        </div>
      ),
    },
  ];

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <PageLayout
      heading="Tournaments"
      subtitle="Manage all tournaments and their settings"
      action={
        <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
          Add tournament
        </Button>
      }
    >
      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 p-4 mb-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search tournaments..."
            leftIcon={<Search size={15} />}
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
          />
          <Select
            options={[{ value: "", label: "All games" }, ...gameOptions]}
            value={filters.gameId || ""}
            onChange={(e) => setFilter("gameId", e.target.value)}
          />
          <Select
            options={STATUS_OPTIONS}
            value={filters.status || ""}
            onChange={(e) => setFilter("status", e.target.value)}
          />
          <Select
            options={[
              { value: "", label: "All" },
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            value={String(filters.isActive)}
            onChange={(e) =>
              setFilter(
                "isActive",
                e.target.value === "" ? "" : e.target.value === "true",
              )
            }
          />
          <Input
            type="date"
            label="From date"
            value={filters.startDate || ""}
            onChange={(e) => setFilter("startDate", e.target.value)}
          />
          <Input
            type="date"
            label="To date"
            value={filters.endDate || ""}
            onChange={(e) => setFilter("endDate", e.target.value)}
          />
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={() => setFilters(initialFilters)}
            >
              Reset filters
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading || isFetching}
        keyExtractor={(t) => t.id}
        emptyMessage="No tournaments found."
      />

      {data && data.totalCount > 0 && (
        <div className="mt-4">
          <Pagination
            page={filters.page}
            pageSize={filters.pageSize}
            totalCount={data.totalCount}
            onPageChange={(p) => setFilters((prev) => ({ ...prev, page: p }))}
            onPageSizeChange={(s) =>
              setFilters((prev) => ({ ...prev, pageSize: s, page: 1 }))
            }
          />
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editItem ? "Edit tournament" : "Add tournament"}
        subtitle={editItem ? `Editing "${editItem.name}"` : undefined}
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={() => formik.handleSubmit()} isLoading={isPending}>
              {editItem ? "Save changes" : "Create tournament"}
            </Button>
          </>
        }
      >
        <form noValidate className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <Input
              label="Tournament name"
              id="name"
              required
              {...formik.getFieldProps("name")}
              error={formik.touched.name ? formik.errors.name : undefined}
            />
          </div>
          <Select
            label="Game"
            id="gameId"
            required
            options={gameOptions}
            placeholder="Select a game"
            value={formik.values.gameId}
            onChange={(e) => formik.setFieldValue("gameId", e.target.value)}
            error={formik.touched.gameId ? formik.errors.gameId : undefined}
          />
          <Select
            label="Tournament type"
            id="tournamentType"
            required
            options={TOURNAMENT_TYPES.map((t) => ({ value: t, label: t }))}
            value={formik.values.tournamentType}
            onChange={(e) =>
              formik.setFieldValue("tournamentType", e.target.value)
            }
            error={
              formik.touched.tournamentType
                ? formik.errors.tournamentType
                : undefined
            }
          />
          <Input
            label="Max participants"
            id="maxParticipants"
            type="number"
            min={2}
            required
            {...formik.getFieldProps("maxParticipants")}
            error={
              formik.touched.maxParticipants
                ? formik.errors.maxParticipants
                : undefined
            }
          />
          <Input
            label="Registration Start date"
            id="registrationStartDate"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            {...formik.getFieldProps("registrationStartDate")}
            error={
              formik.touched.registrationStartDate
                ? formik.errors.registrationStartDate
                : undefined
            }
          />
          <Input
            label="Registration End date"
            id="registrationEndDate"
            type="date"
            min={new Date().toISOString().split("T")[0]}
            required
            {...formik.getFieldProps("registrationEndDate")}
            error={
              formik.touched.registrationEndDate
                ? formik.errors.registrationEndDate
                : undefined
            }
          />
          <Input
            label="Start date"
            id="startDate"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            {...formik.getFieldProps("startDate")}
            error={
              formik.touched.startDate ? formik.errors.startDate : undefined
            }
          />
          <Input
            label="End date"
            id="endDate"
            type="date"
            required
            min={new Date().toISOString().split("T")[0]}
            {...formik.getFieldProps("endDate")}
            error={formik.touched.endDate ? formik.errors.endDate : undefined}
          />
          <Select
            label="Active"
            id="isActive"
            options={[
              { value: "true", label: "Yes" },
              { value: "false", label: "No" },
            ]}
            value={String(formik.values.isActive)}
            onChange={(e) =>
              formik.setFieldValue("isActive", e.target.value === "true")
            }
          />
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteItem}
        onClose={() => setDeleteItem(null)}
        onConfirm={() => deleteItem && deleteMutation.mutate(deleteItem.id)}
        title="Delete tournament"
        message={`Are you sure you want to delete "${deleteItem?.name}"?`}
        isLoading={deleteMutation.isPending}
      />
      <ParticipantsModal
        tournament={participantsTournament}
        isOpen={participantsOpen}
        onClose={() => {
          setParticipantsOpen(false);
          setParticipantsTournament(null);
        }}
      />
      <GenerateMatchesModal
        isOpen={!!generateTournament}
        onClose={() => setGenerateTournament(null)}
        tournamentName={generateTournament?.name ?? ""}
        isLoading={generateMutation.isPending}
        onSubmit={(values) =>
          generateTournament &&
          generateMutation.mutate({ id: generateTournament.id, ...values })
        }
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
