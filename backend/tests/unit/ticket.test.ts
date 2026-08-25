import {
  describe,
  expect,
  test,
} from "bun:test";

import {
  TicketStatus,
} from "@prisma/client";

import {
  isValidStatusTransition,
} from "../../src/services/ticket/ticket.service";

import {
  requireNonEmpty,
} from "../../src/validation/validators";

describe(
  "ticket business rules",
  () => {
    test(
      "OPEN can move to IN_PROGRESS",
      () => {
        expect(
          isValidStatusTransition(
            TicketStatus.OPEN,
            TicketStatus.IN_PROGRESS,
          ),
        ).toBe(true);
      },
    );

    test(
      "IN_PROGRESS can move to RESOLVED",
      () => {
        expect(
          isValidStatusTransition(
            TicketStatus.IN_PROGRESS,
            TicketStatus.RESOLVED,
          ),
        ).toBe(true);
      },
    );

    test(
      "RESOLVED can move to CLOSED",
      () => {
        expect(
          isValidStatusTransition(
            TicketStatus.RESOLVED,
            TicketStatus.CLOSED,
          ),
        ).toBe(true);
      },
    );

    test(
      "CLOSED cannot move directly to IN_PROGRESS",
      () => {
        expect(
          isValidStatusTransition(
            TicketStatus.CLOSED,
            TicketStatus.IN_PROGRESS,
          ),
        ).toBe(false);
      },
    );

    test(
      "empty values are rejected",
      () => {
        expect(() =>
          requireNonEmpty(
            "   ",
            "Ticket title",
          ),
        ).toThrow();
      },
    );
  },
);