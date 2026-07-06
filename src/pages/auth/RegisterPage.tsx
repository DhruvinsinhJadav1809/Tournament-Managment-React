import { useNavigate, Link } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Mail, Lock, User, Trophy } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import axios from "axios";

const registerSchema = Yup.object({
  fullName: Yup.string()
    .trim()
    .required("Full name is required")
    .min(2, "Minimum 2 characters"),
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
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

// ─── Password strength indicator ──────────────────────────────────────────────
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
      {/* Strength bar */}
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                i < passed ? strengthColor : "bg-gray-100"
              }`}
            />
          ))}
        </div>
        <span className={`text-xs font-medium ${strengthText}`}>
          {strength}
        </span>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-1">
        {checks.map((c) => (
          <div key={c.label} className="flex items-center gap-1.5">
            <div
              className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                c.pass
                  ? "bg-emerald-100 dark:bg-emerald-900"
                  : "bg-gray-100 dark:bg-zinc-900"
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
              className={`text-xs ${c.pass ? "text-emerald-600" : "text-gray-400"}`}
            >
              {c.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: authApi.register,
    onSuccess: ({ data }) => {
      if (data.success) {
        toast.success("Account created! Please sign in.");
        navigate("/login");
      } else {
        toast.error(data.message || "Registration failed.");
      }
    },
    onError: (error: unknown) => {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message;
        toast.error(message || "Registration failed.");
      } else {
        toast.error("Something went wrong.");
      }
    },
  });

  const formik = useFormik({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema: registerSchema,
    onSubmit: ({ fullName, email, password }) => {
      mutation.mutate({ fullName, email, password, roleId: null });
    },
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 dark:from-gray-950 via-white dark:via-gray-900 to-blue-50 dark:to-gray-950 flex items-center justify-center p-4">
      {/* Decorative orbs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] bg-brand-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="relative w-full max-w-md">
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-700/50 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-4 shadow-lg shadow-brand-200">
              <Trophy size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Create Account
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Join Tournament Management
            </p>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} noValidate className="space-y-4">
            <Input
              label="Full name"
              id="fullName"
              type="text"
              placeholder="John Doe"
              required
              leftIcon={<User size={16} />}
              {...formik.getFieldProps("fullName")}
              error={
                formik.touched.fullName ? formik.errors.fullName : undefined
              }
            />

            <Input
              label="Email address"
              id="email"
              type="email"
              placeholder="you@example.com"
              required
              leftIcon={<Mail size={16} />}
              {...formik.getFieldProps("email")}
              error={formik.touched.email ? formik.errors.email : undefined}
            />

            <div>
              <Input
                label="Password"
                id="password"
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
              label="Confirm password"
              id="confirmPassword"
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
              isLoading={mutation.isPending}
            >
              Create account
            </Button>
          </form>

          {/* Login link */}
          <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
            Already have an account?{" "}
            <Link
              to="/login"
              className="text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300"
            >
              Sign in
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          © {new Date().getFullYear()} Tournament Management. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
