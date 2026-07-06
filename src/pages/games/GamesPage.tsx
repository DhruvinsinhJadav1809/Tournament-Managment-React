import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import { gamesApi } from "@/api/games";
import type { Game, GameFilters } from "@/types";
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

const gameSchema = Yup.object({
  name: Yup.string()
    .trim()
    .required("Game name is required")
    .min(2, "Minimum 2 characters"),
  participantsPerMatch: Yup.number()
    .required("Participants per match is required")
    .min(2, "Minimum 2")
    .max(100, "Maximum 100"),
  isActive: Yup.boolean().required(),
});

const initialFilters: GameFilters = {
  page: 1,
  pageSize: 10,
  search: "",
  isActive: "",
};

export default function GamesPage() {
  const qc = useQueryClient();
  const [filters, setFilters] = useState<GameFilters>(initialFilters);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGame, setEditGame] = useState<Game | null>(null);
  const [deleteGame, setDeleteGame] = useState<Game | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["games", filters],
    queryFn: () => gamesApi.getAll(filters).then((r) => r.data.data),
  });

  const invalidate = () => qc.invalidateQueries({ queryKey: ["games"] });

  const createMutation = useMutation({
    mutationFn: gamesApi.create,
    onSuccess: () => {
      toast.success("Game created successfully");
      invalidate();
      closeModal();
    },
    onError: () => toast.error("Failed to create game"),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      ...payload
    }: { id: string } & Parameters<typeof gamesApi.update>[1]) =>
      gamesApi.update(id, payload),
    onSuccess: () => {
      toast.success("Game updated successfully");
      invalidate();
      closeModal();
    },
    onError: () => toast.error("Failed to update game"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => gamesApi.delete(id),
    onSuccess: () => {
      toast.success("Game deleted");
      invalidate();
      setDeleteGame(null);
    },
    onError: () => toast.error("Failed to delete game"),
  });

  const formik = useFormik({
    initialValues: {
      name: editGame?.name || "",
      participantsPerMatch: editGame?.participantsPerMatch || 2,
      isActive: editGame?.isActive ?? true,
    },
    enableReinitialize: true,
    validationSchema: gameSchema,
    onSubmit: (values) => {
      if (editGame) {
        updateMutation.mutate({ id: editGame.id, ...values });
      } else {
        createMutation.mutate(values);
      }
    },
  });

  const openCreate = () => {
    setEditGame(null);
    setModalOpen(true);
  };
  const openEdit = (g: Game) => {
    setEditGame(g);
    setModalOpen(true);
  };
  const closeModal = () => {
    setModalOpen(false);
    setEditGame(null);
    formik.resetForm();
  };

  const setFilter = (key: keyof GameFilters, value: unknown) =>
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));

  const columns = [
    {
      key: "name",
      header: "Game Name",
      render: (g: Game) => (
        <span className="font-medium text-gray-900 dark:text-gray-100">
          {g.name}
        </span>
      ),
    },
    {
      key: "participants",
      header: "Participants / Match",
      render: (g: Game) => (
        <span className="text-center">{g.participantsPerMatch}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (g: Game) => (
        <Badge variant={g.isActive ? "success" : "default"}>
          {g.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Created",
      render: (g: Game) => (
        <span className="text-gray-500">{formatDate(g.createdAt)}</span>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (g: Game) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Pencil size={14} />}
            onClick={() => openEdit(g)}
          >
            Edit
          </Button>
          <Button
            variant="ghost"
            size="sm"
            leftIcon={<Trash2 size={14} />}
            onClick={() => setDeleteGame(g)}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
      heading="Games"
      subtitle="Manage all games available for tournaments"
      action={
        <Button leftIcon={<Plus size={16} />} onClick={openCreate}>
          Add game
        </Button>
      }
    >
      {/* Filters */}
      <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 p-4 mb-4 shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Input
            placeholder="Search games..."
            leftIcon={<Search size={15} />}
            value={filters.search}
            onChange={(e) => setFilter("search", e.target.value)}
          />
          <Select
            options={[
              { value: "", label: "All statuses" },
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
            type="number"
            placeholder="Participants per match"
            value={filters.participantsPerMatch || ""}
            onChange={(e) =>
              setFilter(
                "participantsPerMatch",
                e.target.value ? Number(e.target.value) : undefined,
              )
            }
            min={2}
          />
          <Button variant="outline" onClick={() => setFilters(initialFilters)}>
            Reset filters
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        keyExtractor={(g) => g.id}
        emptyMessage="No games found. Add one to get started."
      />

      {/* Pagination */}
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

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editGame ? "Edit game" : "Add new game"}
        subtitle={
          editGame ? `Editing "${editGame.name}"` : "Fill in the details below"
        }
        footer={
          <>
            <Button variant="outline" onClick={closeModal}>
              Cancel
            </Button>
            <Button onClick={() => formik.handleSubmit()} isLoading={isPending}>
              {editGame ? "Save changes" : "Create game"}
            </Button>
          </>
        }
      >
        <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
          <Input
            label="Game name"
            id="name"
            placeholder="e.g. Chess"
            required
            {...formik.getFieldProps("name")}
            error={formik.touched.name ? formik.errors.name : undefined}
          />
          <Input
            label="Participants per match"
            id="participantsPerMatch"
            type="number"
            min={2}
            max={100}
            required
            {...formik.getFieldProps("participantsPerMatch")}
            error={
              formik.touched.participantsPerMatch
                ? formik.errors.participantsPerMatch
                : undefined
            }
          />
          <Select
            label="Status"
            id="isActive"
            options={[
              { value: "true", label: "Active" },
              { value: "false", label: "Inactive" },
            ]}
            value={String(formik.values.isActive)}
            onChange={(e) =>
              formik.setFieldValue("isActive", e.target.value === "true")
            }
            error={formik.touched.isActive ? formik.errors.isActive : undefined}
          />
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteGame}
        onClose={() => setDeleteGame(null)}
        onConfirm={() => deleteGame && deleteMutation.mutate(deleteGame.id)}
        title="Delete game"
        message={`Are you sure you want to delete "${deleteGame?.name}"? This action cannot be undone.`}
        isLoading={deleteMutation.isPending}
      />
    </PageLayout>
  );
}
