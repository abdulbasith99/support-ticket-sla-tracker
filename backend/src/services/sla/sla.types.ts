export type SLAState =
  | "ON_TRACK"
  | "AT_RISK"
  | "BREACHED";

export interface SLAPolicy {
  firstResponseMinutes: number;
  resolutionMinutes: number;
}

export interface SLAClockResult {
  dueAt: Date;
  state: SLAState;
  remainingMinutes: number;
  consumedMinutes: number;
  budgetMinutes: number;
  completed: boolean;
}

export interface TicketSLAResult {
  firstResponse: SLAClockResult;
  resolution: SLAClockResult;
}