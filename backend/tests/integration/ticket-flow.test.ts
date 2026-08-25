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

import {
  addComment,
  createTicket,
  getTicketById,
} from "../../src/services/ticket/ticket.service";

import {
  calculateTicketSLA,
} from "../../src/services/sla/sla.service";

import type {
  AuthUser,
} from "../../src/auth";

let reporter:
  AuthUser;

let agent:
  AuthUser;

let ticketId:
  string | null = null;

beforeAll(async () => {
  await prisma.$connect();

  const suffix =
    Date.now().toString();

  const reporterRecord =
    await prisma.user.create({
      data: {
        name:
          "Integration Reporter",

        email:
          `integration-reporter-${suffix}@example.com`,

        passwordHash:
          "integration-test-only",

        role:
          UserRole.REPORTER,
      },
    });

  const agentRecord =
    await prisma.user.create({
      data: {
        name:
          "Integration Agent",

        email:
          `integration-agent-${suffix}@example.com`,

        passwordHash:
          "integration-test-only",

        role:
          UserRole.AGENT,
      },
    });

  reporter = {
    id:
      reporterRecord.id,

    name:
      reporterRecord.name,

    email:
      reporterRecord.email,

    role:
      reporterRecord.role,
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
  if (ticketId) {
    await prisma.ticket.delete({
      where: {
        id: ticketId,
      },
    });
  }

  await prisma.user.deleteMany({
    where: {
      id: {
        in: [
          reporter.id,
          agent.id,
        ],
      },
    },
  });

  await prisma.$disconnect();
});

describe(
  "real PostgreSQL ticket flow",
  () => {
    test(
      "records first agent response and calculates SLA from persisted ticket",
      async () => {
        const created =
          await createTicket(
            {
              title:
                "Integration test ticket",

              description:
                "Testing persistence and first response.",

              priority:
                Priority.HIGH,
            },

            reporter,
          );

        ticketId =
          created.id;

        await addComment(
          created.id,
          "Reporter follow-up comment",
          reporter,
        );

        const afterReporter =
          await getTicketById(
            created.id,
            reporter,
          );

        expect(
          afterReporter.firstResponseAt,
        ).toBeNull();

        const agentComment =
          await addComment(
            created.id,
            "Agent first response",
            agent,
          );

        const persisted =
          await getTicketById(
            created.id,
            agent,
          );

        expect(
          persisted.firstResponseAt,
        ).not.toBeNull();

        expect(
          persisted.firstResponseAt
            ?.getTime(),
        ).toBe(
          agentComment.createdAt
            .getTime(),
        );

        const holidays =
          await prisma.holiday.findMany();

        const sla =
          calculateTicketSLA(
            persisted,
            holidays,
          );

        expect(
          sla.firstResponse
            .completed,
        ).toBe(true);

        expect(
          sla.firstResponse
            .dueAt
            .getTime(),
        ).toBeGreaterThan(
          persisted.createdAt
            .getTime(),
        );

        const databaseRecord =
          await prisma.ticket.findUnique({
            where: {
              id:
                created.id,
            },
          });

        expect(
          databaseRecord,
        ).not.toBeNull();

        expect(
          databaseRecord
            ?.firstResponseAt,
        ).not.toBeNull();
      },
    );
  },
);