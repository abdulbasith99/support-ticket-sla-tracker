import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import type {
  SLAState,
} from "../../types";

import {
  formatMinutes,
  slaLabel,
} from "../../utils/format";

interface SlaBadgeProps {
  state: SLAState;
  remainingMinutes: number;
  completed?: boolean;
}

export function SlaBadge({
  state,
  remainingMinutes,
  completed = false,
}: SlaBadgeProps) {
  const Icon =
    state === "BREACHED"
      ? AlertTriangle
      : state === "AT_RISK"
        ? Clock3
        : CheckCircle2;

  return (
    <span
      className={[
        "sla-pill",
        `sla-${state.toLowerCase()}`,
      ].join(" ")}
    >
      <Icon size={14} />

      <span>
        {completed
          ? state === "BREACHED"
            ? "Breached"
            : "Met"
          : `${slaLabel(
              state,
            )} · ${formatMinutes(
              remainingMinutes,
            )}`}
      </span>
    </span>
  );
}