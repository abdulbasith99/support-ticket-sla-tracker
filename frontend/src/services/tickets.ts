import {
  graphqlRequest,
} from "./graphql";

import type {
  Comment,
  CreateTicketInput,
  Dashboard,
  Priority,
  SLAState,
  Ticket,
  TicketConnection,
  TicketFilters,
  TicketStatus,
  User,
  UserRole,
} from "../types";

const TICKET_FIELDS = `
  id
  title
  description
  priority
  status
  createdAt
  updatedAt
  firstResponseAt
  resolvedAt

  reporter {
    id
    name
    email
    role
  }

  assignee {
    id
    name
    email
    role
  }

  comments {
    id
    content
    createdAt

    author {
      id
      name
      email
      role
    }
  }

  sla {
    firstResponseDueAt
    resolutionDueAt
    firstResponseState
    resolutionState
    firstResponseRemainingMinutes
    resolutionRemainingMinutes
    firstResponseCompleted
    resolutionCompleted
  }
`;

interface TicketsResponse {
  tickets: TicketConnection;
}

interface TicketResponse {
  ticket: Ticket;
}

interface DashboardResponse {
  dashboard: Dashboard;
}

interface UsersResponse {
  users: User[];
}

interface CreateTicketResponse {
  createTicket: Ticket;
}

interface AssignTicketResponse {
  assignTicket: Ticket;
}

interface ChangeStatusResponse {
  changeTicketStatus: Ticket;
}

interface ResolveTicketResponse {
  resolveTicket: Ticket;
}

interface AddCommentResponse {
  addComment: Comment;
}

export async function getTickets(
  filters: TicketFilters = {},
  token?: string | null,
): Promise<TicketConnection> {
  const query = `
    query Tickets(
      $status: TicketStatus
      $priority: Priority
      $assigneeId: ID
      $slaState: SLAState
      $take: Int
      $cursor: String
    ) {
      tickets(
        status: $status
        priority: $priority
        assigneeId: $assigneeId
        slaState: $slaState
        take: $take
        cursor: $cursor
      ) {
        nodes {
          ${TICKET_FIELDS}
        }

        pageInfo {
          hasNextPage
          endCursor
        }
      }
    }
  `;

  const data =
    await graphqlRequest<TicketsResponse>(
      query,
      {
        status:
          filters.status ?? null,

        priority:
          filters.priority ?? null,

        assigneeId:
          filters.assigneeId ?? null,

        slaState:
          filters.slaState ?? null,

        take:
          filters.take ?? 20,

        cursor:
          filters.cursor ?? null,
      },
      token,
    );

  return data.tickets;
}

export async function getTicket(
  id: string,
  token?: string | null,
): Promise<Ticket> {
  const query = `
    query Ticket($id: ID!) {
      ticket(id: $id) {
        ${TICKET_FIELDS}
      }
    }
  `;

  const data =
    await graphqlRequest<TicketResponse>(
      query,
      { id },
      token,
    );

  return data.ticket;
}

export async function getDashboard(
  token?: string | null,
): Promise<Dashboard> {
  const query = `
    query Dashboard {
      dashboard {
        openTickets
        inProgressTickets
        atRiskTickets
        breachedTickets
      }
    }
  `;

  const data =
    await graphqlRequest<DashboardResponse>(
      query,
      {},
      token,
    );

  return data.dashboard;
}

export async function getUsers(
  role?: UserRole,
  token?: string | null,
): Promise<User[]> {
  const query = `
    query Users($role: UserRole) {
      users(role: $role) {
        id
        name
        email
        role
      }
    }
  `;

  const data =
    await graphqlRequest<UsersResponse>(
      query,
      {
        role: role ?? null,
      },
      token,
    );

  return data.users;
}

export async function createTicket(
  input: CreateTicketInput,
  token: string,
): Promise<Ticket> {
  const query = `
    mutation CreateTicket(
      $title: String!
      $description: String!
      $priority: Priority!
    ) {
      createTicket(
        title: $title
        description: $description
        priority: $priority
      ) {
        ${TICKET_FIELDS}
      }
    }
  `;

  const data =
    await graphqlRequest<CreateTicketResponse>(
      query,
      input,
      token,
    );

  return data.createTicket;
}

export async function assignTicket(
  ticketId: string,
  assigneeId: string,
  token: string,
): Promise<Ticket> {
  const query = `
    mutation AssignTicket(
      $ticketId: ID!
      $assigneeId: ID!
    ) {
      assignTicket(
        ticketId: $ticketId
        assigneeId: $assigneeId
      ) {
        ${TICKET_FIELDS}
      }
    }
  `;

  const data =
    await graphqlRequest<AssignTicketResponse>(
      query,
      {
        ticketId,
        assigneeId,
      },
      token,
    );

  return data.assignTicket;
}

export async function changeStatus(
  ticketId: string,
  status: TicketStatus,
  token: string,
): Promise<Ticket> {
  const query = `
    mutation ChangeStatus(
      $ticketId: ID!
      $status: TicketStatus!
    ) {
      changeTicketStatus(
        ticketId: $ticketId
        status: $status
      ) {
        ${TICKET_FIELDS}
      }
    }
  `;

  const data =
    await graphqlRequest<ChangeStatusResponse>(
      query,
      {
        ticketId,
        status,
      },
      token,
    );

  return data.changeTicketStatus;
}

export async function resolveTicket(
  ticketId: string,
  token: string,
): Promise<Ticket> {
  const query = `
    mutation ResolveTicket(
      $ticketId: ID!
    ) {
      resolveTicket(
        ticketId: $ticketId
      ) {
        ${TICKET_FIELDS}
      }
    }
  `;

  const data =
    await graphqlRequest<ResolveTicketResponse>(
      query,
      {
        ticketId,
      },
      token,
    );

  return data.resolveTicket;
}

export async function addComment(
  ticketId: string,
  content: string,
  token: string,
): Promise<Comment> {
  const query = `
    mutation AddComment(
      $ticketId: ID!
      $content: String!
    ) {
      addComment(
        ticketId: $ticketId
        content: $content
      ) {
        id
        content
        createdAt

        author {
          id
          name
          email
          role
        }
      }
    }
  `;

  const data =
    await graphqlRequest<AddCommentResponse>(
      query,
      {
        ticketId,
        content,
      },
      token,
    );

  return data.addComment;
}

export type {
  Priority,
  SLAState,
  TicketStatus,
};