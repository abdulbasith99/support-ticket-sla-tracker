import {
  Priority,
  TicketStatus,
  UserRole,
  type Prisma,
} from "@prisma/client";

import { prisma } from "../../db/prisma";

import type {
  AuthUser,
} from "../../auth";

import {
  appError,
} from "../../validation/errors";

import {
  requireNonEmpty,
} from "../../validation/validators";

import {
  calculateTicketSLA,
} from "../sla/sla.service";

import type {
  SLAState,
} from "../sla/sla.types";

const ticketInclude = {
  reporter: true,

  assignee: true,

  comments: {
    include: {
      author: true,
    },

    orderBy: {
      createdAt: "asc",
    },
  },
} satisfies Prisma.TicketInclude;

interface TicketFilters {
  status?: TicketStatus | null;
  priority?: Priority | null;
  assigneeId?: string | null;
  slaState?: SLAState | null;
  take?: number | null;
  cursor?: string | null;
}

interface CreateTicketInput {
  title: string;
  description: string;
  priority: Priority;
}

const allowedTransitions: Record<
  TicketStatus,
  readonly TicketStatus[]
> = {
  OPEN: [
    TicketStatus.IN_PROGRESS,
    TicketStatus.RESOLVED,
  ],

  IN_PROGRESS: [
    TicketStatus.OPEN,
    TicketStatus.RESOLVED,
  ],

  RESOLVED: [
    TicketStatus.OPEN,
    TicketStatus.CLOSED,
  ],

  CLOSED: [],
};

export function isValidStatusTransition(
  current: TicketStatus,
  next: TicketStatus,
): boolean {
  if (current === next) {
    return true;
  }

  return allowedTransitions[
    current
  ].includes(next);
}

function getOverallSLAState(
  firstResponseState: SLAState,
  resolutionState: SLAState,
): SLAState {
  if (
    firstResponseState ===
      "BREACHED" ||
    resolutionState ===
      "BREACHED"
  ) {
    return "BREACHED";
  }

  if (
    firstResponseState ===
      "AT_RISK" ||
    resolutionState ===
      "AT_RISK"
  ) {
    return "AT_RISK";
  }

  return "ON_TRACK";
}

function buildTicketAccessWhere(
  currentUser: AuthUser,
): Prisma.TicketWhereInput {
  if (
    currentUser.role ===
    UserRole.AGENT
  ) {
    return {};
  }

  return {
    reporterId:
      currentUser.id,
  };
}

export async function createTicket(
  input: CreateTicketInput,
  reporter: AuthUser,
) {
  if (
    reporter.role !==
    UserRole.REPORTER
  ) {
    throw appError(
      "Only reporters can create support tickets.",
      "FORBIDDEN",
      403,
    );
  }

  const title =
    requireNonEmpty(
      input.title,
      "Ticket title",
    );

  const description =
    requireNonEmpty(
      input.description,
      "Ticket description",
    );

  return prisma.ticket.create({
    data: {
      title,
      description,
      priority: input.priority,
      reporterId:
        reporter.id,
    },

    include:
      ticketInclude,
  });
}

export async function getTicketById(
  ticketId: string,
  currentUser: AuthUser,
) {
  const ticket =
    await prisma.ticket.findUnique({
      where: {
        id: ticketId,
      },

      include:
        ticketInclude,
    });

  if (!ticket) {
    throw appError(
      "Ticket not found.",
      "TICKET_NOT_FOUND",
      404,
    );
  }

  if (
    currentUser.role ===
      UserRole.REPORTER &&
    ticket.reporterId !==
      currentUser.id
  ) {
    throw appError(
      "You do not have permission to access this ticket.",
      "FORBIDDEN",
      403,
    );
  }

  return ticket;
}

export async function getTickets(
  filters: TicketFilters,
  currentUser: AuthUser,
) {
  const requestedTake =
    filters.take ?? 20;

  const take = Math.min(
    Math.max(
      requestedTake,
      1,
    ),
    100,
  );

  const where: Prisma.TicketWhereInput =
    buildTicketAccessWhere(
      currentUser,
    );

  if (filters.status) {
    where.status =
      filters.status;
  }

  if (filters.priority) {
    where.priority =
      filters.priority;
  }

  if (filters.assigneeId) {
    where.assigneeId =
      filters.assigneeId;
  }

  const tickets =
    await prisma.ticket.findMany({
      where,

      orderBy: {
        createdAt: "desc",
      },

      include:
        ticketInclude,
    });

  const holidays =
    filters.slaState
      ? await getHolidays()
      : [];

  const filteredTickets =
    filters.slaState
      ? tickets.filter(
          (ticket) => {
            const sla =
              calculateTicketSLA(
                ticket,
                holidays,
              );

            const overall =
              getOverallSLAState(
                sla.firstResponse
                  .state,
                sla.resolution
                  .state,
              );

            return (
              overall ===
              filters.slaState
            );
          },
        )
      : tickets;

  let startIndex = 0;

  if (filters.cursor) {
    const cursorIndex =
      filteredTickets.findIndex(
        (ticket) =>
          ticket.id ===
          filters.cursor,
      );

    if (
      cursorIndex >= 0
    ) {
      startIndex =
        cursorIndex + 1;
    }
  }

  const page =
    filteredTickets.slice(
      startIndex,
      startIndex +
        take +
        1,
    );

  const hasNextPage =
    page.length > take;

  const nodes =
    hasNextPage
      ? page.slice(0, take)
      : page;

  return {
    nodes,

    pageInfo: {
      hasNextPage,

      endCursor:
        nodes.length > 0
          ? nodes[
              nodes.length - 1
            ]?.id ?? null
          : null,
    },
  };
}

export async function assignTicket(
  ticketId: string,
  assigneeId: string,
  agent: AuthUser,
) {
  const ticket =
    await getTicketById(
      ticketId,
      agent,
    );

  if (
    agent.role !==
    UserRole.AGENT
  ) {
    throw appError(
      "Only agents can assign tickets.",
      "FORBIDDEN",
      403,
    );
  }

  const assignee =
    await prisma.user.findUnique({
      where: {
        id: assigneeId,
      },
    });

  if (!assignee) {
    throw appError(
      "Assignee does not exist.",
      "USER_NOT_FOUND",
      404,
    );
  }

  if (
    assignee.role !==
    UserRole.AGENT
  ) {
    throw appError(
      "Tickets can only be assigned to agents.",
      "VALIDATION_ERROR",
      400,
    );
  }

  return prisma.ticket.update({
    where: {
      id: ticket.id,
    },

    data: {
      assigneeId,
    },

    include:
      ticketInclude,
  });
}

export async function changeTicketStatus(
  ticketId: string,
  nextStatus:
    TicketStatus,
  agent: AuthUser,
) {
  if (
    agent.role !==
    UserRole.AGENT
  ) {
    throw appError(
      "Only agents can change ticket status.",
      "FORBIDDEN",
      403,
    );
  }

  const ticket =
    await getTicketById(
      ticketId,
      agent,
    );

  if (
    !isValidStatusTransition(
      ticket.status,
      nextStatus,
    )
  ) {
    throw appError(
      `Ticket cannot transition from ${ticket.status} to ${nextStatus}.`,
      "INVALID_STATUS_TRANSITION",
      400,
    );
  }

  if (
    ticket.status ===
    nextStatus
  ) {
    return ticket;
  }

  const resolvedAt =
    nextStatus ===
    TicketStatus.RESOLVED
      ? new Date()
      : nextStatus ===
          TicketStatus.OPEN
        ? null
        : ticket.resolvedAt;

  return prisma.ticket.update({
    where: {
      id: ticketId,
    },

    data: {
      status:
        nextStatus,

      resolvedAt,
    },

    include:
      ticketInclude,
  });
}

export async function resolveTicket(
  ticketId: string,
  agent: AuthUser,
) {
  return changeTicketStatus(
    ticketId,
    TicketStatus.RESOLVED,
    agent,
  );
}

export async function addComment(
  ticketId: string,
  content: string,
  author: AuthUser,
) {
  if (!content.trim()) {
    throw appError(
      "Comment cannot be empty.",
      "INVALID_COMMENT",
      400,
    );
  }

  const cleanContent =
    requireNonEmpty(
      content,
      "Comment",
    );

  /*
   * This call is also the
   * authorization check.
   *
   * Reporter -> only own ticket.
   * Agent -> any ticket.
   */
  const ticket =
    await getTicketById(
      ticketId,
      author,
    );

  const comment =
    await prisma.comment.create({
      data: {
        ticketId,
        authorId:
          author.id,
        content:
          cleanContent,
      },

      include: {
        author: true,
      },
    });

  const isFirstResponse =
    ticket.firstResponseAt ===
      null &&
    author.role ===
      UserRole.AGENT &&
    author.id !==
      ticket.reporterId;

  if (isFirstResponse) {
    await prisma.ticket.update({
      where: {
        id: ticketId,
      },

      data: {
        firstResponseAt:
          comment.createdAt,
      },
    });
  }

  return comment;
}

export async function getUsers(
  role?: UserRole | null,
) {
  return prisma.user.findMany({
    where: role
      ? {
          role,
        }
      : undefined,

    orderBy: {
      name: "asc",
    },
  });
}

export async function getHolidays() {
  return prisma.holiday.findMany({
    orderBy: {
      date: "asc",
    },
  });
}

export async function getDashboard(
  currentUser: AuthUser,
) {
  const accessWhere =
    buildTicketAccessWhere(
      currentUser,
    );

  const [
    openTickets,
    inProgressTickets,
    tickets,
    holidays,
  ] = await Promise.all([
    prisma.ticket.count({
      where: {
        ...accessWhere,

        status:
          TicketStatus.OPEN,
      },
    }),

    prisma.ticket.count({
      where: {
        ...accessWhere,

        status:
          TicketStatus.IN_PROGRESS,
      },
    }),

    prisma.ticket.findMany({
      where:
        accessWhere,
    }),

    prisma.holiday.findMany(),
  ]);

  let atRiskTickets = 0;
  let breachedTickets = 0;

  for (
    const ticket of tickets
  ) {
    const sla =
      calculateTicketSLA(
        ticket,
        holidays,
      );

    const overall =
      getOverallSLAState(
        sla.firstResponse
          .state,

        sla.resolution
          .state,
      );

    if (
      overall ===
      "BREACHED"
    ) {
      breachedTickets += 1;
    } else if (
      overall ===
      "AT_RISK"
    ) {
      atRiskTickets += 1;
    }
  }

  return {
    openTickets,
    inProgressTickets,
    atRiskTickets,
    breachedTickets,
  };
}