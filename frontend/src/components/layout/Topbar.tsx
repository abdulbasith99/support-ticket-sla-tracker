import {
  Bell,
  Search,
} from "lucide-react";

import {
  useLocation,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

function getTitle(
  pathname: string,
): string {
  if (
    pathname.startsWith(
      "/tickets/",
    )
  ) {
    return "Ticket details";
  }

  if (
    pathname.startsWith(
      "/tickets",
    )
  ) {
    return "Support tickets";
  }

  return "Operations dashboard";
}

export function Topbar() {
  const location =
    useLocation();

  const {
    user,
  } = useAuth();

  return (
    <header className="topbar">
      <div>
        <p className="eyebrow">
          Support operations
        </p>

        <h1>
          {getTitle(
            location.pathname,
          )}
        </h1>
      </div>

      <div className="topbar-actions">
        <div className="top-search">
          <Search size={17} />

          <span>
            Search workspace
          </span>

          <kbd>⌘ K</kbd>
        </div>

        <button
          className="notification-button"
          aria-label="Notifications"
        >
          <Bell size={18} />

          <span className="notification-dot" />
        </button>

        <div className="top-user">
          <span>
            {user?.name}
          </span>

          <small>
            {user?.role}
          </small>
        </div>
      </div>
    </header>
  );
}