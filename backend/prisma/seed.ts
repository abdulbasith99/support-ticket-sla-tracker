import {
  Priority,
  TicketStatus,
  UserRole,
} from "@prisma/client";

import bcrypt from "bcryptjs";

import {
  prisma,
} from "../src/db/prisma";

async function main(): Promise<void> {
  const reporterPassword =
    await bcrypt.hash(
      "Reporter@123",
      12,
    );

  const agentPassword =
    await bcrypt.hash(
      "Agent@123",
      12,
    );

  const reporter =
    await prisma.user.upsert({
      where: {
        email:
          "reporter@example.com",
      },

      update: {
        name: "Demo Reporter",
        passwordHash:
          reporterPassword,
        role: UserRole.REPORTER,
      },

      create: {
        name: "Demo Reporter",
        email:
          "reporter@example.com",
        passwordHash:
          reporterPassword,
        role: UserRole.REPORTER,
      },
    });

  const agent =
    await prisma.user.upsert({
      where: {
        email:
          "agent@example.com",
      },

      update: {
        name: "Demo Agent",
        passwordHash:
          agentPassword,
        role: UserRole.AGENT,
      },

      create: {
        name: "Demo Agent",
        email:
          "agent@example.com",
        passwordHash:
          agentPassword,
        role: UserRole.AGENT,
      },
    });

  await prisma.ticket.deleteMany({
    where: {
      title: {
        startsWith: "[Seed]",
      },
    },
  });

  const now = new Date();

  const oldDate =
    new Date(
      now.getTime() -
        4 *
          24 *
          60 *
          60 *
          1000,
    );

  await prisma.ticket.create({
    data: {
      title:
        "[Seed] Payment service unavailable",
      description:
        "Customer cannot complete payment.",
      priority:
        Priority.URGENT,
      status:
        TicketStatus.OPEN,
      reporterId:
        reporter.id,
      assigneeId:
        agent.id,
      createdAt:
        oldDate,
    },
  });

  await prisma.ticket.create({
    data: {
      title:
        "[Seed] Login issue",
      description:
        "Customer is unable to sign in.",
      priority:
        Priority.HIGH,
      status:
        TicketStatus.IN_PROGRESS,
      reporterId:
        reporter.id,
      assigneeId:
        agent.id,
    },
  });

  await prisma.ticket.create({
    data: {
      title:
        "[Seed] Account information update",
      description:
        "Customer needs account details updated.",
      priority:
        Priority.MEDIUM,
      status:
        TicketStatus.OPEN,
      reporterId:
        reporter.id,
    },
  });

  const resolvedAt =
    new Date();

  await prisma.ticket.create({
    data: {
      title:
        "[Seed] Minor UI issue",
      description:
        "Small visual issue reported by customer.",
      priority:
        Priority.LOW,
      status:
        TicketStatus.RESOLVED,
      reporterId:
        reporter.id,
      assigneeId:
        agent.id,
      firstResponseAt:
        resolvedAt,
      resolvedAt,
    },
  });

  await prisma.holiday.upsert({
    where: {
      date: new Date(
        "2026-08-15T00:00:00.000Z",
      ),
    },

    update: {
      name:
        "Independence Day",
    },

    create: {
      date: new Date(
        "2026-08-15T00:00:00.000Z",
      ),

      name:
        "Independence Day",
    },
  });

  console.log(
    "Seed data created successfully.",
  );

  console.log(
    "Reporter: reporter@example.com / Reporter@123",
  );

  console.log(
    "Agent: agent@example.com / Agent@123",
  );
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });