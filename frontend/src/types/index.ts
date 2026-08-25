export type UserRole = "REPORTER" | "AGENT";

export type Priority =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "URGENT";

export type TicketStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "CLOSED";

export type SLAState =
  | "ON_TRACK"
  | "AT_RISK"
  | "BREACHED";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export interface Comment {
  id: string;
  content: string;
  author: User;
  createdAt: string;
}

export interface SLAInfo {
  firstResponseDueAt: string;
  resolutionDueAt: string;

  firstResponseState: SLAState;
  resolutionState: SLAState;

  firstResponseRemainingMinutes: number;
  resolutionRemainingMinutes: number;

  firstResponseCompleted: boolean;
  resolutionCompleted: boolean;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: TicketStatus;

  reporter: User;
  assignee: User | null;

  createdAt: string;
  updatedAt: string;

  firstResponseAt: string | null;
  resolvedAt: string | null;

  comments: Comment[];

  sla: SLAInfo;
}

export interface Dashboard {
  openTickets: number;
  inProgressTickets: number;
  atRiskTickets: number;
  breachedTickets: number;
}

export interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

export interface TicketConnection {
  nodes: Ticket[];
  pageInfo: PageInfo;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface GraphQLErrorItem {
  message: string;

  extensions?: {
    code?: string;
  };
}

export interface TicketFilters {
  status?: TicketStatus;
  priority?: Priority;
  assigneeId?: string;
  slaState?: SLAState;
  take?: number;
  cursor?: string;
}

export interface CreateTicketInput {
  title: string;
  description: string;
  priority: Priority;
}