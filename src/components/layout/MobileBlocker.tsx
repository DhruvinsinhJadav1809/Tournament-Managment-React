import { useState, useEffect } from "react";
import { Monitor, Trophy, Smartphone, Tablet } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

// Standard breakpoint — below 1024px show blocker
const BREAKPOINT = 1024;

export default function MobileBlocker({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSmallScreen, setIsSmallScreen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { isAuthenticated } = useAuth();
  //   const navigate = useNavigate();

  useEffect(() => {
    const check = () => {
      setIsSmallScreen(window.innerWidth < BREAKPOINT);
      // Reset dismiss when screen resizes back to small
      if (window.innerWidth < BREAKPOINT) setDismissed(false);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Only block authenticated users inside the app
  // Login/Register pages are fine on mobile
  if (!isAuthenticated || !isSmallScreen || dismissed) {
    return <>{children}</>;
  }

  const isMobile = window.innerWidth < 768;

  return (
    <div className="fixed inset-0 z-[9999] bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
      {/* Background pattern */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-brand-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative flex flex-col items-center max-w-sm w-full">
        {/* Logo */}
        <div className="w-14 h-14 rounded-2xl bg-brand-600 flex items-center justify-center mb-6 shadow-lg shadow-brand-900">
          <Trophy size={26} className="text-white" />
        </div>

        {/* Device icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-3xl bg-gray-800 border border-gray-700 flex items-center justify-center">
            {isMobile ? (
              <Smartphone size={36} className="text-gray-500" />
            ) : (
              <Tablet size={36} className="text-gray-500" />
            )}
          </div>
          {/* X mark */}
          <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-red-500 flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold leading-none">✕</span>
          </div>
        </div>

        {/* Text */}
        <h1 className="text-xl font-bold text-white mb-2">Desktop Only</h1>
        <p className="text-sm text-gray-400 leading-relaxed mb-2">
          Tournament Management is designed for desktop use only.
          {isMobile ? " Mobile" : " Tablet"} screens are not supported.
        </p>
        <p className="text-xs text-gray-500 mb-8">
          Please open this app on a desktop or laptop with a screen width of at
          least {BREAKPOINT}px.
        </p>

        {/* Monitor illustration */}
        <div className="flex items-center gap-3 bg-gray-800/60 border border-gray-700 rounded-2xl px-5 py-3.5 mb-8 w-full justify-center">
          <Monitor size={20} className="text-brand-400 shrink-0" />
          <div className="text-left">
            <p className="text-sm font-medium text-gray-200">
              Use a desktop browser
            </p>
            <p className="text-xs text-gray-500">
              Minimum {BREAKPOINT}px screen width
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-3 w-full">
          {/* Continue anyway — soft dismiss */}
          <button
            onClick={() => setDismissed(true)}
            className="w-full py-3 rounded-xl border border-gray-700 text-sm font-medium text-gray-400 hover:bg-gray-800 hover:text-gray-200 transition-all"
          >
            Continue anyway
          </button>
        </div>

        {/* Current screen size indicator */}
        <ScreenSizeIndicator />
      </div>
    </div>
  );
}

// ─── Live screen size indicator ───────────────────────────────────────────────
function ScreenSizeIndicator() {
  const [width, setWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handler);
    return () => window.removeEventListener("resize", handler);
  }, []);

  return (
    <div className="mt-6 flex items-center gap-2 text-xs text-gray-600">
      <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Current width: <span className="text-gray-400 font-mono">{width}px</span>
      <span className="text-gray-600">/ need {BREAKPOINT}px</span>
    </div>
  );
}
