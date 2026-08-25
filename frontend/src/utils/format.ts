import type {
  Priority,
  SLAState,
  TicketStatus,
} from "../types";

export function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

export function formatMinutes(
  minutes: number,
): string {
  if (minutes <= 0) {
    return "0m";
  }

  if (minutes < 60) {
    return `${minutes}m`;
  }

  const hours =
    Math.floor(minutes / 60);

  const remaining =
    minutes % 60;

  if (hours < 24) {
    return remaining > 0
      ? `${hours}h ${remaining}m`
      : `${hours}h`;
  }

  const days =
    Math.floor(hours / 9);

  const remainderHours =
    hours % 9;

  return remainderHours > 0
    ? `${days}d ${remainderHours}h`
    : `${days}d`;
}

export function titleCase(
  value: string,
): string {
  return value
    .toLowerCase()
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

export function priorityLabel(
  value: Priority,
): string {
  return titleCase(value);
}

export function statusLabel(
  value: TicketStatus,
): string {
  return titleCase(value);
}

export function slaLabel(
  value: SLAState,
): string {
  return value === "ON_TRACK"
    ? "On track"
    : value === "AT_RISK"
      ? "At risk"
      : "Breached";
}

export function initials(
  name: string,
): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map(
      (part) =>
        part.charAt(0),
    )
    .join("")
    .toUpperCase();
}