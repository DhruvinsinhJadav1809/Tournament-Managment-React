import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Eye,
  EyeOff,
  Lock,
  Trophy,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import axios from "axios";
import { invitationsApi } from "@/api/invitations";
import { formatDate } from "@/utils";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";

// ─── Password strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const checks = [
    { label: "Min 8 characters", pass: password.length >= 8 },
    { label: "Uppercase letter", pass: /[A-Z]/.test(password) },
    { label: "Lowercase letter", pass: /[a-z]/.test(password) },
    { label: "Number", pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^a-zA-Z0-9]/.test(password) },
  ];

  const passed = checks.filter((c) => c.pass).length;
  const strength = passed <= 2 ? "Weak" : passed <= 4 ? "Medium" : "Strong";
  const strengthColor =
    passed <= 2
      ? "bg-red-500"
      : passed <= 4
        ? "bg-amber-500"
        : "bg-emerald-500";
  const strengthText =
    passed <= 2
      ? "text-red-500"
      : passed <= 4
        ? "text-amber-500"
        : "text-emerald-600";

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < passed ? strengthColor : "bg-gray-100 dark:bg-gray-800"
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${strengthText}`}>
          {strength}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                c.pass
                  ? "bg-emerald-100 dark:bg-emerald-900"
                  : "bg-gray-100 dark:bg-gray-800"
              }`}
            >
              {c.pass && (
                <svg
                  viewBox="0 0 10 10"
                  className="w-2 h-2 text-emerald-600"
                  fill="none"
                >
                  <path
                    d="M2 5l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
            <span
              className={`text-xs ${c.pass ? "text-emerald-600 dark:text-emerald-400" : "text-gray-400 dark:text-gray-500"}`}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const schema = Yup.object({
  password: Yup.string()
    .required("Password is required")
    .min(8, "Minimum 8 characters")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[0-9]/, "Must contain at least one number")
    .matches(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  confirmPassword: Yup.string()
    .required("Please confirm your password")
    .oneOf([Yup.ref("password")], "Passwords do not match"),
});

export default function InviteRegisterPage() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Fetch invitation details by token
  const { data, isLoading, isError } = useQuery({
    queryKey: ["invitation", token],
    queryFn: () => invitationsApi.getByToken(token!).then((r) => r.data),
    enabled: !!token,
    retry: false,
  });

  const isExpired = data?.data?.expiresAt
    ? new Date(data.data.expiresAt) < new Date()
    : false;

  const registerMutation = useMutation({
    mutationFn: invitationsApi.registerByInvite,
    onSuccess: ({ data: res }) => {
      if (res.success) {
        toast.success("Account created! Please sign in.");
        navigate("/login");
      } else {
        toast.error(res.message || "Registration failed.");
      }
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Registration failed.");
      } else {
        toast.error("Something went wrong.");
      }
    },
  });

  const formik = useFormik({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: schema,
    onSubmit: ({ password }) => {
      registerMutation.mutate({ token: token!, password });
    },
  });

  // ── Loading state ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 size={32} className="animate-spin text-brand-600" />
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Verifying invitation...
          </p>
        </div>
      </div>
    );
  }

  // ── Error state — invalid token or API error ──
  if (isError || !data?.success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-950 flex items-center justify-center mx-auto mb-5">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Invalid Invitation
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            This invitation link is invalid or no longer exists. Please contact
            your administrator for a new invitation.
          </p>
          <Button onClick={() => navigate("/login")} className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  // ── Expired state ──
  if (isExpired) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-10 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 dark:bg-amber-950 flex items-center justify-center mx-auto mb-5">
            <Clock size={28} className="text-amber-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Invitation Expired
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            This invitation expired on{" "}
            <strong className="text-gray-700 dark:text-gray-300">
              {formatDate(data.data.expiresAt)}
            </strong>
            .
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
            Please contact your administrator for a new invitation.
          </p>
          <Button onClick={() => navigate("/login")} className="w-full">
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  const invitation = data.data;

  // ── Valid invitation — show form ──
  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 flex items-center justify-center p-4">
      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] bg-brand-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-4 shadow-lg shadow-brand-200 dark:shadow-brand-900">
              <Trophy size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Accept Invitation
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Complete your registration to join the tournament
            </p>
          </div>

          {/* Invitation info card */}
          <div className="bg-brand-50 dark:bg-brand-950 rounded-2xl p-4 mb-6 border border-brand-100 dark:border-brand-900">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2
                size={15}
                className="text-brand-600 dark:text-brand-400"
              />
              <span className="text-xs font-semibold text-brand-600 dark:text-brand-400 uppercase tracking-wider">
                Invitation Details
              </span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Name</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {invitation.fullName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Email</span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {invitation.email}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">
                  Expires
                </span>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(invitation.expiresAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Password form */}
          <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
            <div>
              <Input
                label="Create Password"
                type={showPassword ? "text" : "password"}
                placeholder="Min. 8 characters"
                required
                leftIcon={<Lock size={16} />}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                {...formik.getFieldProps("password")}
                error={
                  formik.touched.password ? formik.errors.password : undefined
                }
              />
              <PasswordStrength password={formik.values.password} />
            </div>

            <Input
              label="Confirm Password"
              type={showConfirm ? "text" : "password"}
              placeholder="Re-enter password"
              required
              leftIcon={<Lock size={16} />}
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                  tabIndex={-1}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              {...formik.getFieldProps("confirmPassword")}
              error={
                formik.touched.confirmPassword
                  ? formik.errors.confirmPassword
                  : undefined
              }
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={registerMutation.isPending}
            >
              Create Account & Join
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
            >
              Sign in
            </button>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
          © {new Date().getFullYear()} Tournament Management. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
