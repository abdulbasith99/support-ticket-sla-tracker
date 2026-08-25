import {
  useState,
  type FormEvent,
} from "react";

import {
  Flag,
  Plus,
  X,
} from "lucide-react";

import { Button } from "../ui/Button";
import { ErrorBanner } from "../ui/ErrorBanner";

import {
  createTicket,
} from "../../services/tickets";

import {
  useAuth,
} from "../../context/AuthContext";

import type {
  Priority,
  Ticket,
} from "../../types";

interface Props {
  open: boolean;
  onClose: () => void;

  onCreated:
    (ticket: Ticket) => void;
}

export function CreateTicketModal({
  open,
  onClose,
  onCreated,
}: Props) {
  const {
    token,
  } = useAuth();

  const [title, setTitle] =
    useState("");

  const [
    description,
    setDescription,
  ] = useState("");

  const [
    priority,
    setPriority,
  ] =
    useState<Priority>(
      "MEDIUM",
    );

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  if (!open) {
    return null;
  }

  function close() {
    if (loading) {
      return;
    }

    setError("");
    onClose();
  }

  async function submit(
    event: FormEvent,
  ) {
    event.preventDefault();

    if (!token) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const ticket =
        await createTicket(
          {
            title,
            description,
            priority,
          },
          token,
        );

      setTitle("");
      setDescription("");
      setPriority("MEDIUM");

      onCreated(ticket);
      onClose();
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : "Unable to create ticket.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={close}
    >
      <section
        className="modal-card"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >
        <header className="modal-header">
          <div>
            <span className="modal-icon">
              <Plus size={19} />
            </span>

            <div>
              <h2>
                Create support ticket
              </h2>

              <p>
                Tell the support team
                what needs attention.
              </p>
            </div>
          </div>

          <button
            className="icon-button"
            onClick={close}
          >
            <X size={19} />
          </button>
        </header>

        {error && (
          <ErrorBanner
            message={error}
            onClose={() =>
              setError("")
            }
          />
        )}

        <form
          className="ticket-create-form"
          onSubmit={submit}
        >
          <label>
            Ticket title

            <input
              value={title}
              onChange={(event) =>
                setTitle(
                  event.target.value,
                )
              }
              placeholder="Briefly describe the issue"
              required
            />
          </label>

          <label>
            Description

            <textarea
              value={description}
              onChange={(event) =>
                setDescription(
                  event.target.value,
                )
              }
              placeholder="Add enough context for the support team to understand what happened..."
              rows={6}
              required
            />
          </label>

          <label>
            Priority

            <div className="priority-picker">
              {(
                [
                  "LOW",
                  "MEDIUM",
                  "HIGH",
                  "URGENT",
                ] as Priority[]
              ).map((item) => (
                <button
                  key={item}
                  type="button"
                  className={
                    priority === item
                      ? `active priority-${item.toLowerCase()}`
                      : ""
                  }
                  onClick={() =>
                    setPriority(
                      item,
                    )
                  }
                >
                  <Flag size={15} />

                  {item.charAt(0) +
                    item
                      .slice(1)
                      .toLowerCase()}
                </button>
              ))}
            </div>
          </label>

          <div className="modal-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={close}
            >
              Cancel
            </Button>

            <Button
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Creating..."
                : "Create ticket"}
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
}