import { useNavigate } from "react-router-dom";
import { Home, MoveLeft } from "lucide-react";
import Button from "@/components/common/Button";

export function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-black text-brand-100 dark:text-brand-950 mb-2 select-none">
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
          Page not found
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            leftIcon={<MoveLeft size={16} />}
            onClick={() => navigate(-1)}
          >
            Go back
          </Button>
          <Button
            leftIcon={<Home size={16} />}
            onClick={() => navigate("/dashboard")}
          >
            Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
