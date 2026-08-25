import {
  RotateCcw,
  Search,
} from "lucide-react";

import type {
  Priority,
  SLAState,
  TicketStatus,
} from "../../types";

interface Filters {
  status?: TicketStatus;
  priority?: Priority;
  slaState?: SLAState;
}

interface Props {
  filters: Filters;

  search: string;

  sort:
    | "newest"
    | "oldest"
    | "priority";

  onFiltersChange:
    (filters: Filters) => void;

  onSearchChange:
    (value: string) => void;

  onSortChange:
    (
      value:
        | "newest"
        | "oldest"
        | "priority",
    ) => void;
}

export function TicketFilters({
  filters,
  search,
  sort,
  onFiltersChange,
  onSearchChange,
  onSortChange,
}: Props) {
  function reset() {
    onFiltersChange({});
    onSearchChange("");
    onSortChange("newest");
  }

  return (
    <div className="ticket-filters">
      <div className="filter-search">
        <Search size={17} />

        <input
          value={search}
          onChange={(event) =>
            onSearchChange(
              event.target.value,
            )
          }
          placeholder="Search tickets..."
        />
      </div>

      <select
        value={
          filters.status ?? ""
        }
        onChange={(event) =>
          onFiltersChange({
            ...filters,
            status:
              event.target.value
                ? (event.target
                    .value as TicketStatus)
                : undefined,
          })
        }
      >
        <option value="">
          All statuses
        </option>

        <option value="OPEN">
          Open
        </option>

        <option value="IN_PROGRESS">
          In progress
        </option>

        <option value="RESOLVED">
          Resolved
        </option>

        <option value="CLOSED">
          Closed
        </option>
      </select>

      <select
        value={
          filters.priority ?? ""
        }
        onChange={(event) =>
          onFiltersChange({
            ...filters,
            priority:
              event.target.value
                ? (event.target
                    .value as Priority)
                : undefined,
          })
        }
      >
        <option value="">
          All priorities
        </option>

        <option value="URGENT">
          Urgent
        </option>

        <option value="HIGH">
          High
        </option>

        <option value="MEDIUM">
          Medium
        </option>

        <option value="LOW">
          Low
        </option>
      </select>

      <select
        value={
          filters.slaState ?? ""
        }
        onChange={(event) =>
          onFiltersChange({
            ...filters,
            slaState:
              event.target.value
                ? (event.target
                    .value as SLAState)
                : undefined,
          })
        }
      >
        <option value="">
          All SLA states
        </option>

        <option value="ON_TRACK">
          On track
        </option>

        <option value="AT_RISK">
          At risk
        </option>

        <option value="BREACHED">
          Breached
        </option>
      </select>

      <select
        value={sort}
        onChange={(event) =>
          onSortChange(
            event.target.value as
              | "newest"
              | "oldest"
              | "priority",
          )
        }
      >
        <option value="newest">
          Newest first
        </option>

        <option value="oldest">
          Oldest first
        </option>

        <option value="priority">
          Priority
        </option>
      </select>

      <button
        className="filter-reset"
        onClick={reset}
        title="Reset filters"
      >
        <RotateCcw size={16} />
      </button>
    </div>
  );
}