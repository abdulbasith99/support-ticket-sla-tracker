import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  Clock3,
  MessageSquare,
  Send,
  UserRoundCheck,
} from "lucide-react";

import {
  useEffect,
  useState,
  type FormEvent,
} from "react";

import {
  Link,
  useParams,
} from "react-router-dom";

import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { ErrorBanner } from "../components/ui/ErrorBanner";
import { Loader } from "../components/ui/Loader";
import { SlaBadge } from "../components/tickets/SlaBadge";

import {
  useAuth,
} from "../context/AuthContext";

import {
  addComment,
  assignTicket,
  changeStatus,
  getTicket,
  getUsers,
  resolveTicket,
} from "../services/tickets";

import type {
  Ticket,
  TicketStatus,
  User,
} from "../types";

import {
  formatDateTime,
  initials,
  priorityLabel,
  statusLabel,
} from "../utils/format";

export function TicketDetailPage() {
  const {
    id,
  } = useParams();

  const {
    token,
    user,
  } = useAuth();

  const [ticket, setTicket] =
    useState<Ticket | null>(
      null,
    );

  const [agents, setAgents] =
    useState<User[]>([]);

  const [
    comment,
    setComment,
  ] = useState("");

  const [error, setError] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  async function load() {
    if (!id || !token) {
      return;
    }

    setLoading(true);

    try {
      const [
        ticketResult,
        agentResult,
      ] = await Promise.all([
        getTicket(id, token),

        getUsers(
          "AGENT",
          token,
        ),
      ]);

      setTicket(ticketResult);
      setAgents(agentResult);
      setError("");
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to load ticket.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [id, token]);

  async function handleComment(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (
      !token ||
      !ticket ||
      !comment.trim()
    ) {
      return;
    }

    setSaving(true);

    try {
      await addComment(
        ticket.id,
        comment,
        token,
      );

      setComment("");

      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to add comment.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleAssign(
    agentId: string,
  ) {
    if (!token || !ticket) {
      return;
    }

    setSaving(true);

    try {
      await assignTicket(
        ticket.id,
        agentId,
        token,
      );

      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to assign ticket.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleStatus(
    status: TicketStatus,
  ) {
    if (!token || !ticket) {
      return;
    }

    setSaving(true);

    try {
      await changeStatus(
        ticket.id,
        status,
        token,
      );

      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to update status.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleResolve() {
    if (!token || !ticket) {
      return;
    }

    setSaving(true);

    try {
      await resolveTicket(
        ticket.id,
        token,
      );

      await load();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to resolve ticket.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <Loader label="Loading ticket details..." />
    );
  }

  if (!ticket) {
    return (
      <ErrorBanner
        message={
          error ||
          "Ticket not found."
        }
      />
    );
  }

  const isAgent =
    user?.role === "AGENT";

  return (
    <>
      <Link
        to="/tickets"
        className="back-link ticket-back"
      >
        <ArrowLeft size={17} />
        Back to tickets
      </Link>

      {error && (
        <ErrorBanner
          message={error}
          onClose={() =>
            setError("")
          }
        />
      )}

      <section className="ticket-detail-heading">
        <div>
          <div className="detail-tags">
            <Badge
              tone={
                ticket.priority ===
                "URGENT"
                  ? "red"
                  : ticket.priority ===
                      "HIGH"
                    ? "orange"
                    : "blue"
              }
            >
              {priorityLabel(
                ticket.priority,
              )}
            </Badge>

            <span
              className={`status-text status-${ticket.status.toLowerCase()}`}
            >
              <i />
              {statusLabel(
                ticket.status,
              )}
            </span>
          </div>

          <h2>
            {ticket.title}
          </h2>

          <p>
            Ticket #
            {ticket.id.slice(-8)}
          </p>
        </div>

        {isAgent &&
          ticket.status !==
            "RESOLVED" &&
          ticket.status !==
            "CLOSED" && (
            <Button
              disabled={saving}
              icon={
                <CheckCircle2
                  size={18}
                />
              }
              onClick={() =>
                void handleResolve()
              }
            >
              Resolve ticket
            </Button>
          )}
      </section>

      <div className="ticket-detail-grid">
        <section className="ticket-main-column">
          <article className="content-card ticket-description-card">
            <header>
              <span>
                Customer issue
              </span>

              <small>
                {formatDateTime(
                  ticket.createdAt,
                )}
              </small>
            </header>

            <p>
              {ticket.description}
            </p>
          </article>

          <article className="content-card">
            <header className="conversation-header">
              <div>
                <MessageSquare
                  size={19}
                />

                <div>
                  <h3>
                    Conversation
                  </h3>

                  <span>
                    {
                      ticket.comments
                        .length
                    }{" "}
                    messages
                  </span>
                </div>
              </div>
            </header>

            <div className="comment-thread">
              {ticket.comments
                .length === 0 ? (
                <div className="conversation-empty">
                  No comments yet.
                  Start the conversation
                  below.
                </div>
              ) : (
                ticket.comments.map(
                  (item) => (
                    <div
                      className="comment"
                      key={item.id}
                    >
                      <div className="comment-avatar">
                        {initials(
                          item.author
                            .name,
                        )}
                      </div>

                      <div className="comment-body">
                        <div className="comment-meta">
                          <strong>
                            {
                              item.author
                                .name
                            }
                          </strong>

                          <Badge
                            tone={
                              item.author
                                .role ===
                              "AGENT"
                                ? "purple"
                                : "neutral"
                            }
                          >
                            {
                              item.author
                                .role
                            }
                          </Badge>

                          <span>
                            {formatDateTime(
                              item.createdAt,
                            )}
                          </span>
                        </div>

                        <p>
                          {item.content}
                        </p>
                      </div>
                    </div>
                  ),
                )
              )}
            </div>

            <form
              className="comment-compose"
              onSubmit={
                handleComment
              }
            >
              <textarea
                rows={3}
                value={comment}
                onChange={(event) =>
                  setComment(
                    event.target
                      .value,
                  )
                }
                placeholder="Write a comment..."
              />

              <Button
                type="submit"
                disabled={
                  saving ||
                  !comment.trim()
                }
                icon={
                  <Send size={16} />
                }
              >
                Send comment
              </Button>
            </form>
          </article>
        </section>

        <aside className="ticket-side-column">
          <article className="content-card sla-panel">
            <div className="panel-title">
              <Clock3 size={19} />

              <div>
                <h3>
                  SLA health
                </h3>

                <span>
                  Business-hour
                  tracking
                </span>
              </div>
            </div>

            <div className="sla-detail-block">
              <div>
                <span>
                  First response
                </span>

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
              </div>

              <small>
                Due{" "}
                {formatDateTime(
                  ticket.sla
                    .firstResponseDueAt,
                )}
              </small>
            </div>

            <div className="sla-detail-block">
              <div>
                <span>
                  Resolution
                </span>

                <SlaBadge
                  state={
                    ticket.sla
                      .resolutionState
                  }
                  remainingMinutes={
                    ticket.sla
                      .resolutionRemainingMinutes
                  }
                  completed={
                    ticket.sla
                      .resolutionCompleted
                  }
                />
              </div>

              <small>
                Due{" "}
                {formatDateTime(
                  ticket.sla
                    .resolutionDueAt,
                )}
              </small>
            </div>
          </article>

          <article className="content-card detail-info-card">
            <div className="panel-title">
              <UserRoundCheck
                size={19}
              />

              <div>
                <h3>
                  Ownership
                </h3>

                <span>
                  Ticket responsibility
                </span>
              </div>
            </div>

            <dl>
              <div>
                <dt>
                  Reporter
                </dt>

                <dd>
                  {
                    ticket.reporter
                      .name
                  }
                </dd>
              </div>

              <div>
                <dt>
                  Assignee
                </dt>

                <dd>
                  {ticket.assignee
                    ?.name ??
                    "Unassigned"}
                </dd>
              </div>

              <div>
                <dt>
                  Created
                </dt>

                <dd>
                  {formatDateTime(
                    ticket.createdAt,
                  )}
                </dd>
              </div>

              <div>
                <dt>
                  First response
                </dt>

                <dd>
                  {formatDateTime(
                    ticket.firstResponseAt,
                  )}
                </dd>
              </div>
            </dl>

            {isAgent && (
              <label className="agent-control">
                Assign agent

                <select
                  value={
                    ticket.assignee
                      ?.id ?? ""
                  }
                  disabled={saving}
                  onChange={(event) =>
                    void handleAssign(
                      event.target
                        .value,
                    )
                  }
                >
                  <option value="">
                    Select agent
                  </option>

                  {agents.map(
                    (agent) => (
                      <option
                        key={
                          agent.id
                        }
                        value={
                          agent.id
                        }
                      >
                        {
                          agent.name
                        }
                      </option>
                    ),
                  )}
                </select>
              </label>
            )}
          </article>

          {isAgent && (
            <article className="content-card status-panel">
              <div className="panel-title">
                <CalendarClock
                  size={19}
                />

                <div>
                  <h3>
                    Lifecycle
                  </h3>

                  <span>
                    Agent controls
                  </span>
                </div>
              </div>

              <div className="status-actions">
                {(
                  [
                    "OPEN",
                    "IN_PROGRESS",
                    "RESOLVED",
                    "CLOSED",
                  ] as TicketStatus[]
                ).map((status) => (
                  <button
                    key={status}
                    disabled={
                      saving ||
                      ticket.status ===
                        status
                    }
                    className={
                      ticket.status ===
                      status
                        ? "active"
                        : ""
                    }
                    onClick={() =>
                      void handleStatus(
                        status,
                      )
                    }
                  >
                    {statusLabel(
                      status,
                    )}
                  </button>
                ))}
              </div>
            </article>
          )}
        </aside>
      </div>
    </>
  );
}