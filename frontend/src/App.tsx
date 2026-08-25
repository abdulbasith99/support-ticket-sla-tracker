import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import { AppLayout } from "./components/layout/AppLayout";
import { AuthProvider } from "./context/AuthContext";

import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { TicketDetailPage } from "./pages/TicketDetailPage";
import { TicketsPage } from "./pages/TicketsPage";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route
            path="/login"
            element={<LoginPage />}
          />

          <Route
            path="/register"
            element={
              <RegisterPage />
            }
          />

          <Route
            element={
              <AppLayout />
            }
          >
            <Route
              index
              element={
                <DashboardPage />
              }
            />

            <Route
              path="tickets"
              element={
                <TicketsPage />
              }
            />

            <Route
              path="tickets/:id"
              element={
                <TicketDetailPage />
              }
            />
          </Route>

          <Route
            path="*"
            element={
              <Navigate
                to="/"
                replace
              />
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}