import type { ReactNode } from "react";

interface PageLayoutProps {
  heading: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
}

export default function PageLayout({
  heading,
  subtitle,
  action,
  children,
}: PageLayoutProps) {
  return (
    <div className="page-container dark:bg-zinc-800/50">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 tracking-tight">
            {heading}
          </h1>
          {subtitle && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>

      {children}
    </div>
  );
}
