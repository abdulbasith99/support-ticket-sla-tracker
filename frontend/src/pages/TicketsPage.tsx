import {
  Plus,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { CreateTicketModal } from "../components/tickets/CreateTicketModal";
import { TicketFilters } from "../components/tickets/TicketFilters";
import { TicketTable } from "../components/tickets/TicketTable";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Loader } from "../components/ui/Loader";

import {
  useAuth,
} from "../context/AuthContext";

import {
  getTickets,
} from "../services/tickets";

import type {
  Priority,
  SLAState,
  Ticket,
  TicketStatus,
} from "../types";

interface Filters {
  status?: TicketStatus;
  priority?: Priority;
  slaState?: SLAState;
}

const priorityWeight = {
  URGENT: 4,
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

export function TicketsPage() {
  const {
    token,
  } = useAuth();

  const [tickets, setTickets] =
    useState<Ticket[]>([]);

  const [filters, setFilters] =
    useState<Filters>({});

  const [search, setSearch] =
    useState("");

  const [sort, setSort] =
    useState<
      | "newest"
      | "oldest"
      | "priority"
    >("newest");

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
      const result =
        await getTickets(
          {
            ...filters,
            take: 100,
          },
          token,
        );

      setTickets(result.nodes);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load tickets.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [
    token,
    filters.status,
    filters.priority,
    filters.slaState,
  ]);

  const visibleTickets =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      const filtered =
        query
          ? tickets.filter(
              (ticket) =>
                ticket.title
                  .toLowerCase()
                  .includes(query) ||
                ticket.description
                  .toLowerCase()
                  .includes(query),
            )
          : [...tickets];

      filtered.sort(
        (first, second) => {
          if (
            sort ===
            "priority"
          ) {
            return (
              priorityWeight[
                second.priority
              ] -
              priorityWeight[
                first.priority
              ]
            );
          }

          const firstTime =
            new Date(
              first.createdAt,
            ).getTime();

          const secondTime =
            new Date(
              second.createdAt,
            ).getTime();

          return sort ===
            "oldest"
            ? firstTime -
                secondTime
            : secondTime -
                firstTime;
        },
      );

      return filtered;
    }, [
      tickets,
      search,
      sort,
    ]);

  return (
    <>
      <div className="page-heading-row">
        <div>
          <p>
            Ticket workspace
          </p>

          <h2>
            Manage every customer
            issue from one queue.
          </h2>
        </div>

        <Button
          icon={<Plus size={18} />}
          onClick={() =>
            setCreateOpen(true)
          }
        >
          Create ticket
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

      <section className="content-card ticket-list-card">
        <TicketFilters
          filters={filters}
          search={search}
          sort={sort}
          onFiltersChange={
            setFilters
          }
          onSearchChange={
            setSearch
          }
          onSortChange={setSort}
        />

        <div className="ticket-list-meta">
          <strong>
            {
              visibleTickets.length
            }{" "}
            tickets
          </strong>

          <span>
            SLA status is calculated
            by the backend
          </span>
        </div>

        {loading ? (
          <Loader label="Loading support tickets..." />
        ) : (
          <TicketTable
            tickets={
              visibleTickets
            }
          />
        )}
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