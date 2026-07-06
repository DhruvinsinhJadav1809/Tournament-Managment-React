import { useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import { useQuery } from "@tanstack/react-query";
import { Megaphone } from "lucide-react";
import {
  ANNOUNCEMENT_TYPES,
  ANNOUNCEMENT_PRIORITIES,
  TARGET_TYPES,
  type CreateAnnouncementPayload,
  type TargetType,
} from "@/api/announcements";
import { usersApi } from "@/api/users";
import { tournamentsApi } from "@/api/tournaments";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import Select from "@/components/common/Select";

const schema = Yup.object({
  title: Yup.string()
    .trim()
    .required("Title is required")
    .max(200, "Max 200 characters"),
  message: Yup.string()
    .trim()
    .required("Message is required")
    .max(2000, "Max 2000 characters"),
  type: Yup.string().required("Type is required"),
  priority: Yup.string().required("Priority is required"),
  targetType: Yup.string().required("Target type is required"),
  tournamentId: Yup.string().nullable(),
  matchId: Yup.string().nullable(),
  userIds: Yup.array().of(Yup.string()).nullable(),
  expireAt: Yup.string().nullable(),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: CreateAnnouncementPayload) => void;
  isLoading: boolean;
}

export default function CreateAnnouncementModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const formik = useFormik<CreateAnnouncementPayload & { userIds: string[] }>({
    initialValues: {
      title: "",
      message: "",
      type: "Information",
      priority: "Normal",
      targetType: "AllUsers",
      tournamentId: null,
      matchId: null,
      userIds: [],
      expireAt: null,
    },
    validationSchema: schema,
    onSubmit: (values) => {
      const payload: CreateAnnouncementPayload = {
        ...values,
        tournamentId:
          values.targetType === "Tournament" ? values.tournamentId : null,
        matchId: values.targetType === "Match" ? values.matchId : null,
        userIds: values.targetType === "User" ? values.userIds : null,
        expireAt: values.expireAt || null,
      };
      onSubmit(payload);
    },
  });

  const targetType = formik.values.targetType as TargetType;

  // Reset target fields when targetType changes
  useEffect(() => {
    formik.setFieldValue("tournamentId", null);
    formik.setFieldValue("matchId", null);
    formik.setFieldValue("userIds", []);
  }, [targetType]);

  // Fetch based on target
  const { data: allUsers } = useQuery({
    queryKey: ["users-all"],
    queryFn: () =>
      usersApi
        .getAll({ page: 1, pageSize: 100 })
        .then((r) => r.data.data?.data ?? []),
    enabled: targetType === "User",
  });

  const { data: allTournaments } = useQuery({
    queryKey: ["tournaments-dropdown"],
    queryFn: () =>
      tournamentsApi
        .getAll({ page: 1, pageSize: 100 })
        .then((r) => r.data.data?.data ?? []),
    enabled: targetType === "Tournament" || targetType === "Match",
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  // Priority colors
  const priorityColors: Record<string, string> = {
    Low: "text-gray-500",
    Normal: "text-brand-600",
    High: "text-amber-500",
    Critical: "text-red-500",
  };
  useEffect(() => {
    formik.resetForm();
  }, [isOpen]);
  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Create Announcement"
      subtitle="Send a message to targeted users or all players"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftIcon={<Megaphone size={15} />}
            onClick={() => formik.handleSubmit()}
            isLoading={isLoading}
          >
            Send Announcement
          </Button>
        </>
      }
    >
      <form noValidate className="space-y-4">
        {/* Title */}
        <Input
          label="Title"
          id="title"
          placeholder="e.g. Match Reminder"
          required
          {...formik.getFieldProps("title")}
          error={formik.touched.title ? formik.errors.title : undefined}
          hint={`${formik.values.title.length}/200`}
        />

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Message <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            placeholder="Write your announcement message..."
            className={`w-full rounded-xl border bg-white dark:bg-gray-900 px-3.5 py-2.5 text-sm text-gray-900 dark:text-gray-100 outline-none transition-all resize-none placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-brand-500 focus:border-brand-500 ${
              formik.touched.message && formik.errors.message
                ? "border-red-400"
                : "border-gray-200 dark:border-gray-700"
            }`}
            {...formik.getFieldProps("message")}
          />
          <div className="flex justify-between mt-1">
            {formik.touched.message && formik.errors.message ? (
              <p className="text-xs text-red-500">{formik.errors.message}</p>
            ) : (
              <span />
            )}
            <p className="text-xs text-gray-400 dark:text-gray-500 ml-auto">
              {formik.values.message.length}/2000
            </p>
          </div>
        </div>

        {/* Type + Priority */}
        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Type"
            required
            options={ANNOUNCEMENT_TYPES.map((t) => ({ value: t, label: t }))}
            value={formik.values.type}
            onChange={(e) => formik.setFieldValue("type", e.target.value)}
            error={formik.touched.type ? formik.errors.type : undefined}
          />
          <div>
            <Select
              label="Priority"
              required
              options={ANNOUNCEMENT_PRIORITIES.map((p) => ({
                value: p,
                label: p,
              }))}
              value={formik.values.priority}
              onChange={(e) => formik.setFieldValue("priority", e.target.value)}
              error={
                formik.touched.priority ? formik.errors.priority : undefined
              }
            />
            <p
              className={`text-xs mt-1 font-medium ${priorityColors[formik.values.priority]}`}
            >
              {formik.values.priority === "Critical" &&
                "🚨 Will alert all targeted users immediately"}
              {formik.values.priority === "High" &&
                "⚠️ High priority notification"}
              {formik.values.priority === "Normal" &&
                "📢 Standard notification"}
              {formik.values.priority === "Low" && "ℹ️ Low priority info"}
            </p>
          </div>
        </div>

        {/* Expire At */}
        <Input
          label="Expires At (optional)"
          type="datetime-local"
          min={new Date().toISOString().slice(0, 16)}
          value={formik.values.expireAt ?? ""}
          onChange={(e) =>
            formik.setFieldValue("expireAt", e.target.value || null)
          }
        />

        {/* Target Type — radio */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Target <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {TARGET_TYPES.map((t) => {
              const isSelected = formik.values.targetType === t;
              const icons: Record<string, string> = {
                AllUsers: "👥",
                Tournament: "🏆",
                Match: "⚔️",
                User: "👤",
              };
              return (
                <button
                  key={t}
                  type="button"
                  onClick={() => formik.setFieldValue("targetType", t)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    isSelected
                      ? "border-brand-500 bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-300"
                      : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                  }`}
                >
                  <span className="text-lg">{icons[t]}</span>
                  {t === "AllUsers" ? "All Users" : t}
                </button>
              );
            })}
          </div>
        </div>

        {/* Target — Tournament dropdown */}
        {targetType === "Tournament" && (
          <Select
            label="Select Tournament"
            required
            options={(allTournaments ?? []).map((t) => ({
              value: t.id,
              label: t.name,
            }))}
            placeholder="Select a tournament"
            value={formik.values.tournamentId ?? ""}
            onChange={(e) =>
              formik.setFieldValue("tournamentId", e.target.value || null)
            }
            error={
              formik.touched.tournamentId
                ? (formik.errors.tournamentId as string)
                : undefined
            }
          />
        )}

        {/* Target — Match: pick tournament first, then match */}
        {targetType === "Match" && (
          <div className="space-y-3">
            <Select
              label="Select Tournament"
              required
              options={(allTournaments ?? []).map((t) => ({
                value: t.id,
                label: t.name,
              }))}
              placeholder="Select a tournament first"
              value={formik.values.tournamentId ?? ""}
              onChange={(e) => {
                formik.setFieldValue("tournamentId", e.target.value || null);
                formik.setFieldValue("matchId", null);
              }}
            />
            {formik.values.tournamentId && (
              <Input
                label="Match ID"
                placeholder="Enter match ID"
                value={formik.values.matchId ?? ""}
                onChange={(e) =>
                  formik.setFieldValue("matchId", e.target.value || null)
                }
                hint="Enter the specific match ID for this announcement"
              />
            )}
          </div>
        )}

        {/* Target — User multi-select */}
        {targetType === "User" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Select Users <span className="text-red-500">*</span>
            </label>
            <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 divide-y divide-gray-50 dark:divide-gray-800">
              {(allUsers ?? []).map((user) => {
                const isSelected = (formik.values.userIds ?? []).includes(
                  user.id,
                );
                return (
                  <label
                    key={user.id}
                    className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${
                      isSelected ? "bg-brand-50 dark:bg-brand-950" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const current = formik.values.userIds ?? [];
                        formik.setFieldValue(
                          "userIds",
                          e.target.checked
                            ? [...current, user.id]
                            : current.filter((id) => id !== user.id),
                        );
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                    />
                    <div className="flex items-center gap-2.5 flex-1 min-w-0">
                      <div className="w-7 h-7 rounded-full bg-brand-100 dark:bg-brand-900 flex items-center justify-center text-brand-700 dark:text-brand-300 text-xs font-bold shrink-0">
                        {user.fullName[0].toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                          {user.fullName}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>
                  </label>
                );
              })}
              {(allUsers ?? []).length === 0 && (
                <div className="px-4 py-6 text-center text-sm text-gray-400 dark:text-gray-500">
                  Loading users...
                </div>
              )}
            </div>
            {(formik.values.userIds ?? []).length > 0 && (
              <p className="text-xs text-brand-600 dark:text-brand-400 mt-1.5 font-medium">
                {formik.values.userIds?.length} user
                {formik.values.userIds?.length !== 1 ? "s" : ""} selected
              </p>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
}
