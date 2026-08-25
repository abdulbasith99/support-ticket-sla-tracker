import { DateTime } from "luxon";

import {
  BUSINESS_END_HOUR,
  BUSINESS_START_HOUR,
  BUSINESS_TIMEZONE,
} from "./sla.config";

function toBusinessTime(date: Date): DateTime {
  return DateTime.fromJSDate(date, {
    zone: BUSINESS_TIMEZONE,
  });
}

function isWeekend(date: DateTime): boolean {
  return date.weekday === 6 || date.weekday === 7;
}

function isHoliday(
  date: DateTime,
  holidayDates: Set<string>,
): boolean {
  const key = date.toISODate();

  return key !== null && holidayDates.has(key);
}

function isBusinessDay(
  date: DateTime,
  holidayDates: Set<string>,
): boolean {
  return (
    !isWeekend(date) &&
    !isHoliday(date, holidayDates)
  );
}

function businessStart(date: DateTime): DateTime {
  return date.set({
    hour: BUSINESS_START_HOUR,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
}

function businessEnd(date: DateTime): DateTime {
  return date.set({
    hour: BUSINESS_END_HOUR,
    minute: 0,
    second: 0,
    millisecond: 0,
  });
}

function nextDay(date: DateTime): DateTime {
  return date
    .plus({ days: 1 })
    .startOf("day");
}

function normalizeDateTime(
  input: DateTime,
  holidayDates: Set<string>,
): DateTime {
  let current = input.startOf("minute");

  while (true) {
    if (!isBusinessDay(current, holidayDates)) {
      current = businessStart(nextDay(current));
      continue;
    }

    const start = businessStart(current);
    const end = businessEnd(current);

    if (current < start) {
      return start;
    }

    if (current >= end) {
      current = businessStart(nextDay(current));
      continue;
    }

    return current;
  }
}

export function normalizeToBusinessTime(
  input: Date,
  holidayDates: Set<string>,
): Date {
  return normalizeDateTime(
    toBusinessTime(input),
    holidayDates,
  )
    .toUTC()
    .toJSDate();
}

export function addBusinessMinutes(
  start: Date,
  minutesToAdd: number,
  holidayDates: Set<string>,
): Date {
  let current = normalizeDateTime(
    toBusinessTime(start),
    holidayDates,
  );

  let remaining = Math.max(
    0,
    Math.floor(minutesToAdd),
  );

  while (remaining > 0) {
    const end = businessEnd(current);

    const availableMinutes = Math.max(
      0,
      Math.floor(
        end.diff(current, "minutes").minutes,
      ),
    );

    if (remaining <= availableMinutes) {
      return current
        .plus({ minutes: remaining })
        .toUTC()
        .toJSDate();
    }

    remaining -= availableMinutes;

    current = normalizeDateTime(
      nextDay(current),
      holidayDates,
    );
  }

  return current.toUTC().toJSDate();
}

export function businessMinutesBetween(
  start: Date,
  end: Date,
  holidayDates: Set<string>,
): number {
  if (end <= start) {
    return 0;
  }

  let current = normalizeDateTime(
    toBusinessTime(start),
    holidayDates,
  );

  const finish = toBusinessTime(end);

  let totalMinutes = 0;

  while (current < finish) {
    if (!isBusinessDay(current, holidayDates)) {
      current = normalizeDateTime(
        nextDay(current),
        holidayDates,
      );
      continue;
    }

    const dayEnd = businessEnd(current);

    const segmentEnd =
      finish < dayEnd
        ? finish
        : dayEnd;

    if (segmentEnd > current) {
      totalMinutes += Math.floor(
        segmentEnd.diff(
          current,
          "minutes",
        ).minutes,
      );
    }

    if (segmentEnd >= finish) {
      break;
    }

    current = normalizeDateTime(
      nextDay(current),
      holidayDates,
    );
  }

  return Math.max(0, totalMinutes);
}