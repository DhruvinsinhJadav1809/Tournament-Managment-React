import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from "yup";
import { Eye, EyeOff, Mail, Lock, Trophy } from "lucide-react";
import toast from "react-hot-toast";
import { useMutation } from "@tanstack/react-query";
import { authApi } from "@/api/auth";
import { useAuth } from "@/hooks/useAuth";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import { useTheme } from "@/hooks/useTheme";

const loginSchema = Yup.object({
  email: Yup.string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  useTheme();
  const navigate = useNavigate();
  const { login } = useAuth();

  const mutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: ({ data }) => {
      if (data.success) {
        login(data.data);
        toast.success(`Welcome back, ${data.data.fullName}!`);
        navigate("/dashboard");
      } else {
        toast.error(data.message || "Login failed.");
      }
    },
    onError: () => {
      toast.error("Invalid email or password.");
    },
  });

  const formik = useFormik({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: (values) => mutation.mutate(values),
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-50 dark:from-gray-950 via-white dark:via-gray-900 to-blue-50 dark:to-gray-950 flex items-center justify-center p-4">
      {/* Decorative orbs */}
      <div className="pointer-events-none fixed top-0 right-0 w-[600px] h-[600px] bg-brand-100/30 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
      <div className="pointer-events-none fixed bottom-0 left-0 w-[400px] h-[400px] bg-blue-100/30 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />

      <div className="relative w-full max-w-md">
        {/* Card */}
        <div className="bg-white dark:bg-zinc-900 rounded-3xl shadow-xl border border-gray-100 dark:border-zinc-700/50 p-8">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-4 shadow-lg shadow-brand-200">
              <Trophy size={26} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Tournament Management
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1.5">
              Sign in to your account
            </p>
          </div>

          {/* Form */}
          <form onSubmit={formik.handleSubmit} noValidate className="space-y-5">
            <Input
              label="Email address"
              type="email"
              id="email"
              placeholder="you@example.com"
              required
              leftIcon={<Mail size={16} />}
              {...formik.getFieldProps("email")}
              error={formik.touched.email ? formik.errors.email : undefined}
            />

            <Input
              label="Password"
              type={showPassword ? "text" : "password"}
              id="password"
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

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={mutation.isPending}
            >
              Sign in
            </Button>

            <p className="text-center text-xs text-gray-400 dark:text-gray-600 mt-5">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-brand-600 dark:text-brand-400 font-medium hover:text-brand-700 dark:hover:text-brand-300"
              >
                Create one
              </Link>
            </p>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 mt-5">
          © {new Date().getFullYear()} Tournament Management. All rights
          reserved.
        </p>
      </div>
    </div>
  );
}
