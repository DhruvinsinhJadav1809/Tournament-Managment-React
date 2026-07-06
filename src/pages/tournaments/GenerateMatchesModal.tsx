import { useFormik } from "formik";
import * as Yup from "yup";
import { Zap } from "lucide-react";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";
import type { GenerateMatchesPayload } from "@/api/matches";

const schema = Yup.object({
  startDate: Yup.string().required("Start date is required"),
  firstMatchTime: Yup.string().required("First match time is required"),
  matchDurationMinutes: Yup.number()
    .required("Required")
    .min(1, "Minimum 1 minute"),
  matchesPerDay: Yup.number().required("Required").min(1, "Minimum 1"),
  breakMinutes: Yup.number().required("Required").min(0, "Cannot be negative"),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: GenerateMatchesPayload) => void;
  isLoading: boolean;
  tournamentName: string;
}

export default function GenerateMatchesModal({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  tournamentName,
}: Props) {
  const formik = useFormik<GenerateMatchesPayload>({
    initialValues: {
      startDate: "",
      firstMatchTime: "09:00",
      matchDurationMinutes: 30,
      matchesPerDay: 4,
      breakMinutes: 10,
    },
    validationSchema: schema,
    onSubmit,
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Generate Matches"
      subtitle={`Configure match schedule for "${tournamentName}"`}
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftIcon={<Zap size={15} />}
            onClick={() => formik.handleSubmit()}
            isLoading={isLoading}
          >
            Generate
          </Button>
        </>
      }
    >
      <form noValidate className="space-y-4">
        <Input
          label="Start Date"
          type="date"
          required
          min={new Date().toISOString().split("T")[0]}
          {...formik.getFieldProps("startDate")}
          error={formik.touched.startDate ? formik.errors.startDate : undefined}
        />
        <Input
          label="First Match Time"
          type="time"
          required
          {...formik.getFieldProps("firstMatchTime")}
          error={
            formik.touched.firstMatchTime
              ? formik.errors.firstMatchTime
              : undefined
          }
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Match Duration (min)"
            type="number"
            min={1}
            required
            {...formik.getFieldProps("matchDurationMinutes")}
            error={
              formik.touched.matchDurationMinutes
                ? formik.errors.matchDurationMinutes
                : undefined
            }
          />
          <Input
            label="Break Between (min)"
            type="number"
            min={0}
            required
            {...formik.getFieldProps("breakMinutes")}
            error={
              formik.touched.breakMinutes
                ? formik.errors.breakMinutes
                : undefined
            }
          />
        </div>
        <Input
          label="Matches Per Day"
          type="number"
          min={1}
          required
          {...formik.getFieldProps("matchesPerDay")}
          error={
            formik.touched.matchesPerDay
              ? formik.errors.matchesPerDay
              : undefined
          }
        />
      </form>
    </Modal>
  );
}
