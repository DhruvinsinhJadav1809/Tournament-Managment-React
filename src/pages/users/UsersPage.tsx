import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { usersApi } from "@/api/users";
import type { User } from "@/types";
import { formatDate } from "@/utils";
import PageLayout from "@/components/common/PageLayout";
import Table from "@/components/common/Table";
import Input from "@/components/common/Input";
import Badge from "@/components/common/Badge";
import Pagination from "@/components/common/Pagination";
import Button from "@/components/common/Button";

export default function UsersPage() {
  const [filters, setFilters] = useState({ page: 1, pageSize: 10, search: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["users", filters],
    queryFn: () => usersApi.getAll(filters).then((r) => r.data.data),
  });

  const columns = [
    {
      key: "name",
      header: "Full Name",
      render: (u: User) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 text-xs font-semibold shrink-0">
            {u.fullName
              .split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100">
            {u.fullName}
          </span>
        </div>
      ),
    },
    {
      key: "email",
      header: "Email",
      render: (u: User) => <span className="text-gray-500">{u.email}</span>,
    },
    {
      key: "role",
      header: "Role",
      render: (u: User) => (
        <Badge variant={u.role === "Admin" ? "info" : "default"}>
          {u.role}
        </Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (u: User) => (
        <Badge variant={u.isActive ? "success" : "danger"}>
          {u.isActive ? "Active" : "Inactive"}
        </Badge>
      ),
    },
    {
      key: "createdAt",
      header: "Joined",
      render: (u: User) => (
        <span className="text-gray-500">{formatDate(u.createdAt)}</span>
      ),
    },
  ];

  return (
    <PageLayout
      heading="Users"
      subtitle="View all registered users in the system"
    >
      <div className="bg-white dark:bg-zinc-800/50 rounded-2xl border border-gray-100 dark:border-zinc-700/50 p-4 mb-4 shadow-card">
        <div className="flex gap-3">
          <Input
            placeholder="Search by name or email..."
            leftIcon={<Search size={15} />}
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({
                ...prev,
                search: e.target.value,
                page: 1,
              }))
            }
            className="max-w-sm"
          />
          <Button
            variant="outline"
            onClick={() => setFilters({ page: 1, pageSize: 10, search: "" })}
          >
            Reset
          </Button>
        </div>
      </div>
      <Table
        columns={columns}
        data={data?.data || []}
        isLoading={isLoading}
        keyExtractor={(u) => u.id}
        emptyMessage="No users found."
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
    </PageLayout>
  );
}
