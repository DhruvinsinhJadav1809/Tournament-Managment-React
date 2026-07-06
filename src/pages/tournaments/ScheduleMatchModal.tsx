import { useFormik } from "formik";
import * as Yup from "yup";
import { CalendarClock } from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import type { Match } from "@/api/matches";

interface Props {
  match: Match | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (
    matchId: string,
    payload: { matchDate: string; startTime: string; endTime: string },
  ) => void;
  isLoading: boolean;
}

export default function ScheduleMatchModal({
  match,
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}: Props) {
  const formik = useFormik({
    initialValues: {
      matchDate: "",
      startTime: "",
      endTime: "",
    },
    validationSchema: Yup.object({
      matchDate: Yup.string().required("Match date is required"),
      startTime: Yup.string().required("Start time is required"),
      endTime: Yup.string()
        .required("End time is required")
        .test(
          "after-start",
          "End time must be after start time",
          function (val) {
            const { startTime, matchDate } = this.parent;
            if (!val || !startTime || !matchDate) return true;
            return (
              new Date(`${matchDate}T${val}`) >
              new Date(`${matchDate}T${startTime}`)
            );
          },
        ),
    }),
    onSubmit: (values) => {
      if (!match) return;
      onSubmit(match.matchId, {
        matchDate: `${values.matchDate}T00:00:00`,
        startTime: `${values.matchDate}T${values.startTime}:00`,
        endTime: `${values.matchDate}T${values.endTime}:00`,
      });
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Schedule Match"
      subtitle={
        match
          ? `Match #${match.matchNumber} · ${match.player1Name ?? "TBD"} vs ${match.player2Name ?? "TBD"}`
          : ""
      }
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftIcon={<CalendarClock size={15} />}
            onClick={() => formik.handleSubmit()}
            isLoading={isLoading}
          >
            Save Schedule
          </Button>
        </>
      }
    >
      <form noValidate className="space-y-4">
        <Input
          label="Match Date"
          type="date"
          required
          min={new Date().toISOString().split("T")[0]}
          {...formik.getFieldProps("matchDate")}
          error={formik.touched.matchDate ? formik.errors.matchDate : undefined}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Start Time"
            type="time"
            required
            {...formik.getFieldProps("startTime")}
            error={
              formik.touched.startTime ? formik.errors.startTime : undefined
            }
          />
          <Input
            label="End Time"
            type="time"
            required
            {...formik.getFieldProps("endTime")}
            error={formik.touched.endTime ? formik.errors.endTime : undefined}
          />
        </div>

        {/* Preview */}
        {formik.values.matchDate &&
          formik.values.startTime &&
          formik.values.endTime && (
            <div className="flex items-center gap-2 bg-brand-50 rounded-xl px-4 py-3 text-xs text-brand-700">
              <CalendarClock size={13} />
              <span>
                {new Date(formik.values.matchDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
                {" · "}
                {formik.values.startTime} – {formik.values.endTime}
              </span>
            </div>
          )}
      </form>
    </Modal>
  );
}
