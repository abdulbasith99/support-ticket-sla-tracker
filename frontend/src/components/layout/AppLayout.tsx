import {
  Navigate,
  Outlet,
} from "react-router-dom";

import {
  Sidebar,
} from "./Sidebar";

import {
  Topbar,
} from "./Topbar";

import {
  useAuth,
} from "../../context/AuthContext";

export function AppLayout() {
  const {
    isAuthenticated,
  } = useAuth();

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return (
    <div className="app-shell">
      <Sidebar />

      <div className="workspace">
        <Topbar />

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}