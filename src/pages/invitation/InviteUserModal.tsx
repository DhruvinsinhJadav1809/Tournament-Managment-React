import { useFormik } from "formik";
import * as Yup from "yup";
import { Mail, Send, UserRound } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { invitationsApi } from "@/api/invitations";
import Modal from "@/components/common/Modal";
import Button from "@/components/common/Button";
import Input from "@/components/common/Input";

const schema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  fullName: Yup.string().required("Full name is required"),
});

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteUserModal({ isOpen, onClose }: Props) {
  // CHANGE onError
  const mutation = useMutation({
    mutationFn: invitationsApi.send,
    onSuccess: ({ data }) => {
      if (data.success) {
        toast.success(`Invitation sent to ${formik.values.email}!`);
        handleClose();
      } else {
        toast.error(data.message || "Failed to send invitation.");
      }
    },
    onError: (error: unknown) => {
      // Handle 400/500 HTTP errors — read backend message
      const axiosErr = error as {
        response?: { data?: { message?: string; success?: boolean } };
      };
      const message = axiosErr?.response?.data?.message;
      toast.error(message || "Failed to send invitation.");
    },
  });

  const formik = useFormik({
    initialValues: {
      email: "",
      fullName: "",
    },
    enableReinitialize: true,
    validationSchema: schema,
    onSubmit: (values) => mutation.mutate(values),
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Invite Player"
      subtitle="Send a tournament invitation via email"
      size="sm"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftIcon={<Send size={15} />}
            onClick={() => formik.handleSubmit()}
            isLoading={mutation.isPending}
          >
            Send Invitation
          </Button>
        </>
      }
    >
      <form noValidate className="space-y-4">
        {/* Full Name */}
        <Input
          label="Player Full Name"
          id="fullName"
          placeholder="Dhruvinsinh Jadav"
          required
          leftIcon={<UserRound size={15} />}
          {...formik.getFieldProps("fullName")}
          error={formik.touched.fullName ? formik.errors.fullName : undefined}
        />
        {/* Email */}
        <Input
          label="Player Email"
          id="email"
          type="email"
          placeholder="player@example.com"
          required
          leftIcon={<Mail size={15} />}
          {...formik.getFieldProps("email")}
          error={formik.touched.email ? formik.errors.email : undefined}
        />
      </form>
    </Modal>
  );
}
