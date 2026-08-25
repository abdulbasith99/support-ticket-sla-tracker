import {
  ArrowUpRight,
  UserRound,
} from "lucide-react";

import {
  useNavigate,
} from "react-router-dom";

import { Badge } from "../ui/Badge";
import { EmptyState } from "../ui/EmptyState";
import { SlaBadge } from "./SlaBadge";

import type {
  Ticket,
} from "../../types";

import {
  formatDateTime,
  priorityLabel,
  statusLabel,
} from "../../utils/format";

interface Props {
  tickets: Ticket[];
}

function priorityTone(
  priority: Ticket["priority"],
) {
  if (priority === "URGENT") {
    return "red" as const;
  }

  if (priority === "HIGH") {
    return "orange" as const;
  }

  if (priority === "MEDIUM") {
    return "blue" as const;
  }

  return "neutral" as const;
}

export function TicketTable({
  tickets,
}: Props) {
  const navigate =
    useNavigate();

  if (tickets.length === 0) {
    return (
      <EmptyState
        title="No tickets found"
        description="Try adjusting your filters or create a new support ticket."
      />
    );
  }

  return (
    <div className="table-wrap">
      <table className="ticket-table">
        <thead>
          <tr>
            <th>Ticket</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Assignee</th>
            <th>Response SLA</th>
            <th>Created</th>
            <th />
          </tr>
        </thead>

        <tbody>
          {tickets.map(
            (ticket) => (
              <tr
                key={ticket.id}
                onClick={() =>
                  navigate(
                    `/tickets/${ticket.id}`,
                  )
                }
              >
                <td>
                  <div className="ticket-name">
                    <span className="ticket-id">
                      #
                      {ticket.id.slice(
                        -6,
                      )}
                    </span>

                    <strong>
                      {ticket.title}
                    </strong>

                    <small>
                      {ticket.description}
                    </small>
                  </div>
                </td>

                <td>
                  <Badge
                    tone={priorityTone(
                      ticket.priority,
                    )}
                  >
                    {priorityLabel(
                      ticket.priority,
                    )}
                  </Badge>
                </td>

                <td>
                  <span
                    className={`status-text status-${ticket.status.toLowerCase()}`}
                  >
                    <i />

                    {statusLabel(
                      ticket.status,
                    )}
                  </span>
                </td>

                <td>
                  {ticket.assignee ? (
                    <div className="table-user">
                      <div>
                        {ticket.assignee.name
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span>
                        {
                          ticket
                            .assignee
                            .name
                        }
                      </span>
                    </div>
                  ) : (
                    <span className="unassigned">
                      <UserRound
                        size={14}
                      />
                      Unassigned
                    </span>
                  )}
                </td>

                <td>
                  <SlaBadge
                    state={
                      ticket.sla
                        .firstResponseState
                    }
                    remainingMinutes={
                      ticket.sla
                        .firstResponseRemainingMinutes
                    }
                    completed={
                      ticket.sla
                        .firstResponseCompleted
                    }
                  />
                </td>

                <td>
                  <span className="table-date">
                    {formatDateTime(
                      ticket.createdAt,
                    )}
                  </span>
                </td>

                <td>
                  <ArrowUpRight
                    size={17}
                  />
                </td>
              </tr>
            ),
          )}
        </tbody>
      </table>
    </div>
  );
}