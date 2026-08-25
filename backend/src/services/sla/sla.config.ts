import type { Priority } from "@prisma/client";
import type { SLAPolicy } from "./sla.types";

export const BUSINESS_START_HOUR = 9;
export const BUSINESS_END_HOUR = 18;

export const BUSINESS_TIMEZONE =
  process.env.BUSINESS_TIMEZONE ??
  "Asia/Kolkata";

export const SLA_POLICIES: Record<
  Priority,
  SLAPolicy
> = {
  URGENT: {
    firstResponseMinutes: 60,
    resolutionMinutes: 240,
  },

  HIGH: {
    firstResponseMinutes: 240,
    resolutionMinutes: 1440,
  },

  MEDIUM: {
    firstResponseMinutes: 480,
    resolutionMinutes: 2880,
  },

  LOW: {
    firstResponseMinutes: 1440,
    resolutionMinutes: 4320,
  },
};