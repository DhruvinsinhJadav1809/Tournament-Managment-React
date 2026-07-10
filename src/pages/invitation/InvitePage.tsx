import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  Send,
  AlertTriangle,
  Users,
  LucideIcon,
} from "lucide-react";
import {
  invitationsApi,
  InvitationStatus,
  type InvitationListItem,
} from "@/api/invitations";
import { formatDate } from "@/utils";
import PageLayout from "@/components/common/PageLayout";
import Button from "@/components/common/Button";
import Badge from "@/components/common/Badge";
import Table from "@/components/common/Table";
import Pagination from "@/components/common/Pagination";
import InviteUserModal from "./InviteUserModal";

// ─── Status config ────────────────────────────────────────────────────────────
const statusConfig: Record<
  InvitationStatus,
  {
    label: string;
    variant: any;
    icon: LucideIcon;
  }
> = {
  [InvitationStatus.Pending]: {
    label: "Pending",
    variant: "warning",
    icon: Clock,
  },
  [InvitationStatus.Accepted]: {
    label: "Accepted",
    variant: "success",
    icon: CheckCircle2,
  },
  [InvitationStatus.Expired]: {
    label: "Expired",
    variant: "danger", // ✅ instead of destructive
    icon: AlertTriangle,
  },
  [InvitationStatus.Cancelled]: {
    label: "Cancelled",
    variant: "default", // ✅ or "info", depending on your design
    icon: XCircle,
  },
};
// ─── Main Page ────────────────────────────────────────────────────────────────
export default function InvitePage() {
  const qc = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["invitations", page, pageSize],
    queryFn: () =>
      invitationsApi.getAll({ page, pageSize }).then((r) => r.data.data),
  });

  const handleCloseModal = () => {
    setModalOpen(false);
    // Immediately refetch list after sending
    qc.invalidateQueries({ queryKey: ["invitations"] });
  };

  const columns = [
    {
      key: "player",
      header: "Player",
      render: (item: InvitationListItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-bold shrink-0">
            {item.fullName[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {item.fullName}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {item.email}
            </p>
          </div>
        </div>
      ),
    },

    {
      key: "status",
      header: "Status",
      render: (item: InvitationListItem) => {
        const config = statusConfig[item.status as InvitationStatus] ?? {
          label: "Unknown",
          variant: "default",
          icon: Clock,
        };

        const Icon = config.icon;

        return (
          <Badge
            variant={config.variant}
            className="flex items-center gap-1 w-fit"
          >
            <Icon size={11} />
            {config.label}
          </Badge>
        );
      },
    },
    {
      key: "dates",
      header: "Dates",
      render: (item: InvitationListItem) => (
        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <Send size={11} className="text-gray-400" />
            <span>Sent: {formatDate(item.createdAt)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={11} className="text-gray-400" />
            <span>Expires: {formatDate(item.expiresAt)}</span>
          </div>
          {item.acceptedAt && (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={11} className="text-emerald-500" />
              <span className="text-emerald-600 dark:text-emerald-400">
                Accepted: {formatDate(item.acceptedAt)}
              </span>
            </div>
          )}
        </div>
      ),
    },
  ];

  // ── Summary stats ──
  const items = data?.items ?? [];
  const stats = {
    total: items.length,
    pending: items.filter((i) => i.status === InvitationStatus.Pending).length,
    accepted: items.filter((i) => i.status === InvitationStatus.Accepted)
      .length,
    expired: items.filter((i) => i.status === InvitationStatus.Expired).length,
    cancelled: items.filter((i) => i.status === InvitationStatus.Cancelled)
      .length,
  };

  return (
    <PageLayout
      heading="Invitations"
      subtitle="Manage player invitations for tournaments"
      action={
        <Button
          leftIcon={<Plus size={16} />}
          onClick={() => setModalOpen(true)}
        >
          Send Invitation
        </Button>
      }
    >
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Total Sent",
            value: data?.totalCount ?? 0,
            icon: Users,
            color:
              "bg-brand-50 dark:bg-brand-950 text-brand-600 dark:text-brand-400",
          },
          {
            label: "Pending",
            value: stats.pending,
            icon: Clock,
            color:
              "bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400",
          },
          {
            label: "Accepted",
            value: stats.accepted,
            icon: CheckCircle2,
            color:
              "bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400",
          },
          {
            label: "Expired",
            value: stats.expired,
            icon: AlertTriangle,
            color: "bg-red-50 dark:bg-red-950 text-red-500 dark:text-red-400",
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-card p-4 flex items-center gap-3"
          >
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${color.split(" ").slice(0, 2).join(" ")}`}
            >
              <Icon size={18} className={color.split(" ").slice(2).join(" ")} />
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

      {/* Table */}
      <Table
        columns={columns}
        data={data?.items ?? []}
        isLoading={isLoading || isFetching}
        keyExtractor={(item) => item.id}
        emptyMessage="No invitations sent yet. Click 'Send Invitation' to get started."
      />

      {data && data.totalCount > 0 && (
        <div className="mt-4">
          <Pagination
            page={page}
            pageSize={pageSize}
            totalCount={data.totalCount}
            onPageChange={setPage}
            onPageSizeChange={(s) => {
              setPageSize(s);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* Modal */}
      <InviteUserModal isOpen={modalOpen} onClose={handleCloseModal} />
    </PageLayout>
  );
}
