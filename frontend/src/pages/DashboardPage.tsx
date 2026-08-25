import {
  AlertTriangle,
  ArrowRight,
  CircleDot,
  Clock3,
  Plus,
  TicketCheck,
} from "lucide-react";

import {
  useEffect,
  useState,
} from "react";

import {
  Link,
} from "react-router-dom";

import { StatCard } from "../components/dashboard/StatCard";
import { CreateTicketModal } from "../components/tickets/CreateTicketModal";
import { TicketTable } from "../components/tickets/TicketTable";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Loader } from "../components/ui/Loader";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getDashboard,
  getTickets,
} from "../services/tickets";

import type {
  Dashboard,
  Ticket,
} from "../types";

export function DashboardPage() {
  const {
    token,
    user,
  } = useAuth();

  const [dashboard, setDashboard] =
    useState<Dashboard | null>(
      null,
    );

  const [tickets, setTickets] =
    useState<Ticket[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [createOpen, setCreateOpen] =
    useState(false);

  async function load() {
    if (!token) {
      return;
    }

    setLoading(true);

    try {
      const [
        dashboardResult,
        ticketResult,
      ] = await Promise.all([
        getDashboard(token),

        getTickets(
          {
            take: 5,
          },
          token,
        ),
      ]);

      setDashboard(
        dashboardResult,
      );

      setTickets(
        ticketResult.nodes,
      );

      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [token]);

  if (loading) {
    return (
      <Loader label="Preparing your support workspace..." />
    );
  }

  return (
    <>
      <div className="page-heading-row">
        <div>
          <p>
            Welcome back,{" "}
            <strong>
              {user?.name}
            </strong>
          </p>

          <h2>
            Here’s what needs your
            attention today.
          </h2>
        </div>

        <Button
          icon={<Plus size={18} />}
          onClick={() =>
            setCreateOpen(true)
          }
        >
          New ticket
        </Button>
      </div>

      {error && (
        <ErrorBanner
          message={error}
          onClose={() =>
            setError("")
          }
        />
      )}

      {dashboard && (
        <section className="stats-grid">
          <StatCard
            label="Open tickets"
            value={
              dashboard.openTickets
            }
            icon={
              <CircleDot
                size={21}
              />
            }
            tone="blue"
          />

          <StatCard
            label="In progress"
            value={
              dashboard
                .inProgressTickets
            }
            icon={
              <TicketCheck
                size={21}
              />
            }
            tone="green"
          />

          <StatCard
            label="At risk"
            value={
              dashboard.atRiskTickets
            }
            icon={
              <Clock3 size={21} />
            }
            tone="orange"
          />

          <StatCard
            label="SLA breached"
            value={
              dashboard
                .breachedTickets
            }
            icon={
              <AlertTriangle
                size={21}
              />
            }
            tone="red"
          />
        </section>
      )}

      <section className="content-card">
        <header className="content-card-header">
          <div>
            <span>
              Live queue
            </span>

            <h3>
              Recent support tickets
            </h3>
          </div>

          <Link
            to="/tickets"
            className="text-link"
          >
            View all
            <ArrowRight size={16} />
          </Link>
        </header>

        <TicketTable
          tickets={tickets}
        />
      </section>

      <CreateTicketModal
        open={createOpen}
        onClose={() =>
          setCreateOpen(false)
        }
        onCreated={() => {
          void load();
        }}
      />
    </>
  );
}