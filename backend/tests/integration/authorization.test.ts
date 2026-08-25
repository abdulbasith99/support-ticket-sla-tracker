import {
  afterAll,
  beforeAll,
  describe,
  expect,
  test,
} from "bun:test";

import {
  Priority,
  UserRole,
} from "@prisma/client";

import {
  prisma,
} from "../../src/db/prisma";

import type {
  AuthUser,
} from "../../src/auth";

import {
  addComment,
  createTicket,
  getDashboard,
  getTicketById,
  getTickets,
} from "../../src/services/ticket/ticket.service";

let reporterOne:
  AuthUser;

let reporterTwo:
  AuthUser;

let agent:
  AuthUser;

const createdUserIds:
  string[] = [];

const createdTicketIds:
  string[] = [];

beforeAll(async () => {
  await prisma.$connect();

  const suffix =
    Date.now().toString();

  const reporterOneRecord =
    await prisma.user.create({
      data: {
        name:
          "Authorization Reporter One",

        email:
          `auth-r1-${suffix}@example.com`,

        passwordHash:
          "test",

        role:
          UserRole.REPORTER,
      },
    });

  const reporterTwoRecord =
    await prisma.user.create({
      data: {
        name:
          "Authorization Reporter Two",

        email:
          `auth-r2-${suffix}@example.com`,

        passwordHash:
          "test",

        role:
          UserRole.REPORTER,
      },
    });

  const agentRecord =
    await prisma.user.create({
      data: {
        name:
          "Authorization Agent",

        email:
          `auth-agent-${suffix}@example.com`,

        passwordHash:
          "test",

        role:
          UserRole.AGENT,
      },
    });

  createdUserIds.push(
    reporterOneRecord.id,
    reporterTwoRecord.id,
    agentRecord.id,
  );

  reporterOne = {
    id:
      reporterOneRecord.id,

    name:
      reporterOneRecord.name,

    email:
      reporterOneRecord.email,

    role:
      reporterOneRecord.role,
  };

  reporterTwo = {
    id:
      reporterTwoRecord.id,

    name:
      reporterTwoRecord.name,

    email:
      reporterTwoRecord.email,

    role:
      reporterTwoRecord.role,
  };

  agent = {
    id:
      agentRecord.id,

    name:
      agentRecord.name,

    email:
      agentRecord.email,

    role:
      agentRecord.role,
  };
});

afterAll(async () => {
  await prisma.comment.deleteMany({
    where: {
      ticketId: {
        in:
          createdTicketIds,
      },
    },
  });

  await prisma.ticket.deleteMany({
    where: {
      id: {
        in:
          createdTicketIds,
      },
    },
  });

  await prisma.user.deleteMany({
    where: {
      id: {
        in:
          createdUserIds,
      },
    },
  });

  await prisma.$disconnect();
});

describe(
  "ticket authorization",
  () => {
    test(
      "reporter sees only their own tickets",
      async () => {
        const first =
          await createTicket(
            {
              title:
                "Reporter one issue",

              description:
                "Private reporter one ticket",

              priority:
                Priority.MEDIUM,
            },

            reporterOne,
          );

        const second =
          await createTicket(
            {
              title:
                "Reporter two issue",

              description:
                "Private reporter two ticket",

              priority:
                Priority.HIGH,
            },

            reporterTwo,
          );

        createdTicketIds.push(
          first.id,
          second.id,
        );

        const reporterOneTickets =
          await getTickets(
            {
              take: 100,
            },

            reporterOne,
          );

        expect(
          reporterOneTickets.nodes.some(
            (ticket) =>
              ticket.id ===
              first.id,
          ),
        ).toBe(true);

        expect(
          reporterOneTickets.nodes.some(
            (ticket) =>
              ticket.id ===
              second.id,
          ),
        ).toBe(false);
      },
    );

    test(
      "reporter cannot open another reporter ticket",
      async () => {
        const otherTicket =
          await createTicket(
            {
              title:
                "Reporter two private ticket",

              description:
                "Must not be accessible by reporter one",

              priority:
                Priority.LOW,
            },

            reporterTwo,
          );

        createdTicketIds.push(
          otherTicket.id,
        );

        await expect(
          getTicketById(
            otherTicket.id,
            reporterOne,
          ),
        ).rejects.toThrow(
          "permission",
        );
      },
    );

    test(
      "reporter cannot comment on another reporter ticket",
      async () => {
        const otherTicket =
          await createTicket(
            {
              title:
                "Private comment test",

              description:
                "Only owner or agents may comment",

              priority:
                Priority.MEDIUM,
            },

            reporterTwo,
          );

        createdTicketIds.push(
          otherTicket.id,
        );

        await expect(
          addComment(
            otherTicket.id,
            "I should not be able to add this.",
            reporterOne,
          ),
        ).rejects.toThrow(
          "permission",
        );
      },
    );

    test(
      "agent can see all reporters tickets",
      async () => {
        const agentTickets =
          await getTickets(
            {
              take: 100,
            },

            agent,
          );

        const reporterOneTicket =
          createdTicketIds[0];

        const reporterTwoTicket =
          createdTicketIds[1];

        expect(
          agentTickets.nodes.some(
            (ticket) =>
              ticket.id ===
              reporterOneTicket,
          ),
        ).toBe(true);

        expect(
          agentTickets.nodes.some(
            (ticket) =>
              ticket.id ===
              reporterTwoTicket,
          ),
        ).toBe(true);
      },
    );

    test(
      "reporter dashboard contains only their own ticket counts",
      async () => {
        const dashboard =
          await getDashboard(
            reporterOne,
          );

        const ownTickets =
          await prisma.ticket.count({
            where: {
              reporterId:
                reporterOne.id,

              status: "OPEN",
            },
          });

        expect(
          dashboard.openTickets,
        ).toBe(
          ownTickets,
        );
      },
    );
  },
);