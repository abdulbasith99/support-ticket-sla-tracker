import {
  Priority,
  TicketStatus,
  UserRole,
} from "@prisma/client";

import type {
  GraphQLContext,
} from "../../auth";

import {
  requireAgent,
  requireAuthentication,
} from "../../auth";

import {
  loginUser,
  registerUser,
} from "../../services/auth/auth.service";

import {
  addComment,
  assignTicket,
  changeTicketStatus,
  createTicket,
  getDashboard,
  getHolidays,
  getTicketById,
  getTickets,
  getUsers,
  resolveTicket,
} from "../../services/ticket/ticket.service";

import {
  calculateTicketSLA,
} from "../../services/sla/sla.service";

import type {
  SLAState,
} from "../../services/sla/sla.types";

interface TicketListArgs {
  status?: TicketStatus | null;
  priority?: Priority | null;
  assigneeId?: string | null;
  slaState?: SLAState | null;
  take?: number | null;
  cursor?: string | null;
}

interface TicketIdArgs {
  id: string;
}

interface RegisterArgs {
  name: string;
  email: string;
  password: string;
}

interface LoginArgs {
  email: string;
  password: string;
}

interface CreateTicketArgs {
  title: string;
  description: string;
  priority: Priority;
}

interface AssignTicketArgs {
  ticketId: string;
  assigneeId: string;
}

interface ChangeStatusArgs {
  ticketId: string;
  status: TicketStatus;
}

interface AddCommentArgs {
  ticketId: string;
  content: string;
}

interface ResolveTicketArgs {
  ticketId: string;
}

interface UsersArgs {
  role?: UserRole | null;
}

function dateToIso(
  value:
    | Date
    | null
    | undefined,
): string | null {
  return value
    ? value.toISOString()
    : null;
}

export const resolvers = {
  Query: {
    tickets: (
      _parent: unknown,
      args: TicketListArgs,
      context:
        GraphQLContext,
    ) => {
      const user =
        requireAuthentication(
          context,
        );

      return getTickets(
        args,
        user,
      );
    },

    ticket: (
      _parent: unknown,
      args: TicketIdArgs,
      context:
        GraphQLContext,
    ) => {
      const user =
        requireAuthentication(
          context,
        );

      return getTicketById(
        args.id,
        user,
      );
    },

    dashboard: (
      _parent: unknown,
      _args:
        Record<
          string,
          never
        >,
      context:
        GraphQLContext,
    ) => {
      const user =
        requireAuthentication(
          context,
        );

      return getDashboard(
        user,
      );
    },

    users: (
      _parent: unknown,
      args: UsersArgs,
      context:
        GraphQLContext,
    ) => {
      /*
       * Only agents need access
       * to the agent directory.
       */
      requireAgent(
        context,
      );

      return getUsers(
        args.role,
      );
    },

    holidays: (
      _parent: unknown,
      _args:
        Record<
          string,
          never
        >,
      context:
        GraphQLContext,
    ) => {
      requireAuthentication(
        context,
      );

      return getHolidays();
    },
  },

  Mutation: {
    register: (
      _parent: unknown,
      args: RegisterArgs,
    ) =>
      registerUser({
        name: args.name,
        email: args.email,
        password:
          args.password,
      }),

    login: (
      _parent: unknown,
      args: LoginArgs,
    ) =>
      loginUser({
        email: args.email,
        password:
          args.password,
      }),

    createTicket: (
      _parent: unknown,
      args:
        CreateTicketArgs,
      context:
        GraphQLContext,
    ) => {
      const user =
        requireAuthentication(
          context,
        );

      return createTicket(
        {
          title:
            args.title,

          description:
            args.description,

          priority:
            args.priority,
        },

        user,
      );
    },

    assignTicket: (
      _parent: unknown,
      args:
        AssignTicketArgs,
      context:
        GraphQLContext,
    ) => {
      const agent =
        requireAgent(
          context,
        );

      return assignTicket(
        args.ticketId,
        args.assigneeId,
        agent,
      );
    },

    changeTicketStatus: (
      _parent: unknown,
      args:
        ChangeStatusArgs,
      context:
        GraphQLContext,
    ) => {
      const agent =
        requireAgent(
          context,
        );

      return changeTicketStatus(
        args.ticketId,
        args.status,
        agent,
      );
    },

    addComment: (
      _parent: unknown,
      args:
        AddCommentArgs,
      context:
        GraphQLContext,
    ) => {
      const user =
        requireAuthentication(
          context,
        );

      return addComment(
        args.ticketId,
        args.content,
        user,
      );
    },

    resolveTicket: (
      _parent: unknown,
      args:
        ResolveTicketArgs,
      context:
        GraphQLContext,
    ) => {
      const agent =
        requireAgent(
          context,
        );

      return resolveTicket(
        args.ticketId,
        agent,
      );
    },
  },

  User: {
    createdAt: (
      parent: {
        createdAt: Date;
      },
    ) =>
      parent.createdAt.toISOString(),
  },

  Ticket: {
    createdAt: (
      parent: {
        createdAt: Date;
      },
    ) =>
      parent.createdAt.toISOString(),

    updatedAt: (
      parent: {
        updatedAt: Date;
      },
    ) =>
      parent.updatedAt.toISOString(),

    firstResponseAt: (
      parent: {
        firstResponseAt:
          Date | null;
      },
    ) =>
      dateToIso(
        parent.firstResponseAt,
      ),

    resolvedAt: (
      parent: {
        resolvedAt:
          Date | null;
      },
    ) =>
      dateToIso(
        parent.resolvedAt,
      ),

    sla: async (
      parent: {
        priority: Priority;
        createdAt: Date;
        firstResponseAt:
          Date | null;
        resolvedAt:
          Date | null;
      },
    ) => {
      const holidays =
        await getHolidays();

      const result =
        calculateTicketSLA(
          parent,
          holidays,
        );

      return {
        firstResponseDueAt:
          result
            .firstResponse
            .dueAt
            .toISOString(),

        resolutionDueAt:
          result
            .resolution
            .dueAt
            .toISOString(),

        firstResponseState:
          result
            .firstResponse
            .state,

        resolutionState:
          result
            .resolution
            .state,

        firstResponseRemainingMinutes:
          result
            .firstResponse
            .remainingMinutes,

        resolutionRemainingMinutes:
          result
            .resolution
            .remainingMinutes,

        firstResponseCompleted:
          result
            .firstResponse
            .completed,

        resolutionCompleted:
          result
            .resolution
            .completed,
      };
    },
  },

  Comment: {
    createdAt: (
      parent: {
        createdAt: Date;
      },
    ) =>
      parent.createdAt.toISOString(),
  },

  Holiday: {
    date: (
      parent: {
        date: Date;
      },
    ) =>
      parent.date.toISOString(),
  },
};