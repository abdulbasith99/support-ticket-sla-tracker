import { DateTime } from "luxon";

import type {
  Holiday,
  Ticket,
} from "@prisma/client";

import {
  addBusinessMinutes,
  businessMinutesBetween,
} from "./business-time";

import {
  BUSINESS_TIMEZONE,
  SLA_POLICIES,
} from "./sla.config";

import type {
  SLAClockResult,
  SLAState,
  TicketSLAResult,
} from "./sla.types";

function buildHolidaySet(
  holidays: Holiday[],
): Set<string> {
  return new Set(
    holidays
      .map((holiday) =>
        DateTime.fromJSDate(
          holiday.date,
          { zone: "utc" },
        )
          .setZone(BUSINESS_TIMEZONE)
          .toISODate(),
      )
      .filter(
        (date): date is string =>
          date !== null,
      ),
  );
}

function calculateActiveState(
  consumedMinutes: number,
  budgetMinutes: number,
  deadlinePassed: boolean,
): SLAState {
  if (deadlinePassed) {
    return "BREACHED";
  }

  const ratio =
    budgetMinutes === 0
      ? 1
      : consumedMinutes / budgetMinutes;

  // Assignment rule:
  // 0%–75% = ON_TRACK
  // >75% = AT_RISK
  return ratio > 0.75
    ? "AT_RISK"
    : "ON_TRACK";
}

function calculateClock(
  createdAt: Date,
  completedAt: Date | null,
  budgetMinutes: number,
  now: Date,
  holidayDates: Set<string>,
): SLAClockResult {
  const dueAt = addBusinessMinutes(
    createdAt,
    budgetMinutes,
    holidayDates,
  );

  const evaluationTime =
    completedAt ?? now;

  const actualConsumed =
    businessMinutesBetween(
      createdAt,
      evaluationTime,
      holidayDates,
    );

  const consumedMinutes =
    Math.min(
      budgetMinutes,
      actualConsumed,
    );

  if (completedAt) {
    const completedOnTime =
      completedAt <= dueAt;

    return {
      dueAt,
      state: completedOnTime
        ? "ON_TRACK"
        : "BREACHED",
      remainingMinutes: 0,
      consumedMinutes,
      budgetMinutes,
      completed: true,
    };
  }

  const deadlinePassed =
    now > dueAt;

  return {
    dueAt,
    state: calculateActiveState(
      consumedMinutes,
      budgetMinutes,
      deadlinePassed,
    ),
    remainingMinutes:
      deadlinePassed
        ? 0
        : Math.max(
            0,
            budgetMinutes -
              consumedMinutes,
          ),
    consumedMinutes,
    budgetMinutes,
    completed: false,
  };
}

export function calculateTicketSLA(
  ticket: Pick<
    Ticket,
    | "priority"
    | "createdAt"
    | "firstResponseAt"
    | "resolvedAt"
  >,
  holidays: Holiday[],
  now = new Date(),
): TicketSLAResult {
  const holidayDates =
    buildHolidaySet(holidays);

  const policy =
    SLA_POLICIES[ticket.priority];

  return {
    firstResponse: calculateClock(
      ticket.createdAt,
      ticket.firstResponseAt,
      policy.firstResponseMinutes,
      now,
      holidayDates,
    ),

    resolution: calculateClock(
      ticket.createdAt,
      ticket.resolvedAt,
      policy.resolutionMinutes,
      now,
      holidayDates,
    ),
  };
}