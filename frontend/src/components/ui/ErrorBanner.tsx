import {
  AlertTriangle,
  X,
} from "lucide-react";

interface ErrorBannerProps {
  message: string;
  onClose?: () => void;
}

export function ErrorBanner({
  message,
  onClose,
}: ErrorBannerProps) {
  return (
    <div className="error-banner">
      <div className="error-banner-content">
        <AlertTriangle size={18} />

        <span>{message}</span>
      </div>

      {onClose && (
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close error"
        >
          <X size={17} />
        </button>
      )}
    </div>
  );
}