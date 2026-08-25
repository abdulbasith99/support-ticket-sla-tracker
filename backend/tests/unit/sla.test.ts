import {
  describe,
  expect,
  test,
} from "bun:test";

import {
  DateTime,
} from "luxon";

import type {
  Holiday,
  Ticket,
} from "@prisma/client";

import {
  addBusinessMinutes,
} from "../../src/services/sla/business-time";

import {
  calculateTicketSLA,
} from "../../src/services/sla/sla.service";

const ZONE =
  "Asia/Kolkata";

function local(
  iso: string,
): Date {
  return DateTime.fromISO(
    iso,
    {
      zone: ZONE,
    },
  )
    .toUTC()
    .toJSDate();
}

function localIso(
  date: Date,
): string {
  return DateTime.fromJSDate(
    date,
    {
      zone: "utc",
    },
  )
    .setZone(ZONE)
    .toFormat(
      "yyyy-MM-dd HH:mm",
    );
}

function holiday(
  date: string,
): Holiday {
  return {
    id: `holiday-${date}`,
    date: new Date(
      `${date}T00:00:00.000Z`,
    ),
    name: "Test Holiday",
    createdAt:
      new Date(),
  };
}

function ticket(
  overrides: Partial<
    Pick<
      Ticket,
      | "priority"
      | "createdAt"
      | "firstResponseAt"
      | "resolvedAt"
    >
  > = {},
) {
  return {
    priority:
      "URGENT" as const,

    createdAt:
      local(
        "2026-08-24T09:00:00",
      ),

    firstResponseAt: null,

    resolvedAt: null,

    ...overrides,
  };
}

describe(
  "business-hours SLA engine",
  () => {
    test(
      "normal weekday calculation",
      () => {
        const result =
          addBusinessMinutes(
            local(
              "2026-08-24T10:00:00",
            ),
            240,
            new Set(),
          );

        expect(
          localIso(result),
        ).toBe(
          "2026-08-24 14:00",
        );
      },
    );

    test(
      "ticket before business hours starts at 09:00",
      () => {
        const result =
          addBusinessMinutes(
            local(
              "2026-08-24T07:00:00",
            ),
            60,
            new Set(),
          );

        expect(
          localIso(result),
        ).toBe(
          "2026-08-24 10:00",
        );
      },
    );

    test(
      "ticket after business hours starts next business day",
      () => {
        const result =
          addBusinessMinutes(
            local(
              "2026-08-24T20:00:00",
            ),
            60,
            new Set(),
          );

        expect(
          localIso(result),
        ).toBe(
          "2026-08-25 10:00",
        );
      },
    );

    test(
      "weekend is skipped",
      () => {
        const result =
          addBusinessMinutes(
            local(
              "2026-08-22T11:00:00",
            ),
            60,
            new Set(),
          );

        expect(
          localIso(result),
        ).toBe(
          "2026-08-24 10:00",
        );
      },
    );

    test(
      "Friday evening continues Monday",
      () => {
        const result =
          addBusinessMinutes(
            local(
              "2026-08-21T17:00:00",
            ),
            240,
            new Set(),
          );

        expect(
          localIso(result),
        ).toBe(
          "2026-08-24 12:00",
        );
      },
    );

    test(
      "public holiday contributes zero business hours",
      () => {
        const holidays =
          new Set([
            "2026-08-24",
          ]);

        const result =
          addBusinessMinutes(
            local(
              "2026-08-21T17:00:00",
            ),
            240,
            holidays,
          );

        expect(
          localIso(result),
        ).toBe(
          "2026-08-25 12:00",
        );
      },
    );

    test(
      "weekend plus holiday combination",
      () => {
        const holidays =
          new Set([
            "2026-08-24",
          ]);

        const result =
          addBusinessMinutes(
            local(
              "2026-08-22T12:00:00",
            ),
            60,
            holidays,
          );

        expect(
          localIso(result),
        ).toBe(
          "2026-08-25 10:00",
        );
      },
    );

    test(
      "SLA can cross multiple business days",
      () => {
        const result =
          addBusinessMinutes(
            local(
              "2026-08-24T09:00:00",
            ),
            1440,
            new Set(),
          );

        expect(
          localIso(result),
        ).toBe(
          "2026-08-26 15:00",
        );
      },
    );

    test(
      "exactly 75 percent consumed remains ON_TRACK",
      () => {
        const result =
          calculateTicketSLA(
            ticket(),
            [],
            local(
              "2026-08-24T09:45:00",
            ),
          );

        expect(
          result.firstResponse.state,
        ).toBe(
          "ON_TRACK",
        );
      },
    );

    test(
      "greater than 75 percent becomes AT_RISK",
      () => {
        const result =
          calculateTicketSLA(
            ticket(),
            [],
            local(
              "2026-08-24T09:46:00",
            ),
          );

        expect(
          result.firstResponse.state,
        ).toBe(
          "AT_RISK",
        );
      },
    );

    test(
      "past deadline becomes BREACHED",
      () => {
        const result =
          calculateTicketSLA(
            ticket(),
            [],
            local(
              "2026-08-24T10:01:00",
            ),
          );

        expect(
          result.firstResponse.state,
        ).toBe(
          "BREACHED",
        );
      },
    );

    test(
      "completed first response stays completed and does not breach later",
      () => {
        const result =
          calculateTicketSLA(
            ticket({
              firstResponseAt:
                local(
                  "2026-08-24T09:30:00",
                ),
            }),
            [],
            local(
              "2026-08-27T15:00:00",
            ),
          );

        expect(
          result.firstResponse.completed,
        ).toBe(true);

        expect(
          result.firstResponse.state,
        ).toBe(
          "ON_TRACK",
        );
      },
    );

    test(
      "resolution SLA is calculated separately",
      () => {
        const result =
          calculateTicketSLA(
            ticket(),
            [],
            local(
              "2026-08-24T10:00:00",
            ),
          );

        expect(
          localIso(
            result.resolution.dueAt,
          ),
        ).toBe(
          "2026-08-24 13:00",
        );
      },
    );

    test(
      "configured holiday changes SLA deadline",
      () => {
        const result =
          calculateTicketSLA(
            ticket({
              createdAt:
                local(
                  "2026-08-21T17:00:00",
                ),
            }),
            [
              holiday(
                "2026-08-24",
              ),
            ],
            local(
              "2026-08-21T17:10:00",
            ),
          );

        expect(
          localIso(
            result.resolution.dueAt,
          ),
        ).toBe(
          "2026-08-25 12:00",
        );
      },
    );
  },
);