import {
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  TicketCheck,
} from "lucide-react";

import {
  NavLink,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  initials,
} from "../../utils/format";

export function Sidebar() {
  const {
    user,
    logout,
  } = useAuth();

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-mark">
          <LifeBuoy size={22} />
        </div>

        <div>
          <strong>
            Resolve
          </strong>

          <span>
            SLA Workspace
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink
          to="/"
          end
          className={({
            isActive,
          }) =>
            `nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <LayoutDashboard
            size={19}
          />

          <span>
            Dashboard
          </span>
        </NavLink>

        <NavLink
          to="/tickets"
          className={({
            isActive,
          }) =>
            `nav-item ${
              isActive
                ? "active"
                : ""
            }`
          }
        >
          <TicketCheck
            size={19}
          />

          <span>
            Tickets
          </span>
        </NavLink>
      </nav>

      <div className="sidebar-footer">
        <div className="user-card">
          <div className="avatar">
            {initials(
              user?.name ??
                "User",
            )}
          </div>

          <div className="user-card-copy">
            <strong>
              {user?.name}
            </strong>

            <span>
              {user?.role ===
              "AGENT"
                ? "Support agent"
                : "Reporter"}
            </span>
          </div>

          <button
            className="logout-button"
            onClick={logout}
            title="Sign out"
          >
            <LogOut size={17} />
          </button>
        </div>
      </div>
    </aside>
  );
}