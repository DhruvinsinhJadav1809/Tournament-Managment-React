import { cn } from "@/utils";

interface BadgeProps {
  variant?: "success" | "danger" | "warning" | "info" | "default";
  children: React.ReactNode;
  className?: string;
}

const variants = {
  success:
    "bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-800",
  danger:
    "bg-red-50 dark:bg-red-950 text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-800",
  warning:
    "bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-400 ring-1 ring-amber-200 dark:ring-amber-800",
  info: "bg-brand-50 dark:bg-brand-950 text-brand-700 dark:text-brand-400 ring-1 ring-brand-200 dark:ring-brand-800",
  default:
    "bg-gray-100 dark:bg-zinc-900 text-gray-600 dark:text-gray-400 ring-1 ring-gray-200 dark:ring-gray-700",
};

export default function Badge({
  variant = "default",
  children,
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
    >
      {children}
    </span>
  );
}
