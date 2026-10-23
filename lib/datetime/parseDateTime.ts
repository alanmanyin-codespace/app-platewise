import type { DateTimeLike } from './types';

import { createSafeFunction } from '../utils/createSafeFunction';

export interface ParseDatetimeOptions {
    preferredTimezone?: string;
}

export const parseDateTimeSafe = createSafeFunction(parseDateTime);

export function parseDateTime(
    input: DateTimeLike,
    options: ParseDatetimeOptions = {}
): Temporal.ZonedDateTime {
    const { preferredTimezone = Temporal.Now.timeZoneId() } = options;

    if (input instanceof Temporal.ZonedDateTime) {
        return input;
    }

    if (input instanceof Temporal.Instant) {
        return input.toZonedDateTimeISO(preferredTimezone);
    }

    if (input instanceof Temporal.PlainDateTime || input instanceof Temporal.PlainDate) {
        return input.toZonedDateTime(preferredTimezone);
    }

    if (input instanceof Date) {
        return Temporal.Instant.fromEpochMilliseconds(input.getTime()).toZonedDateTimeISO(
            preferredTimezone
        );
    }

    if (typeof input === 'number') {
        return Temporal.Instant.fromEpochMilliseconds(input).toZonedDateTimeISO(preferredTimezone);
    }

    if (typeof input === 'string') {
        // Try ZonedDateTime.from (best if it has TZ info)
        try {
            return Temporal.ZonedDateTime.from(input);
        } catch {}

        // Try Instant.from (good for ISO strings with Z or offsets)
        try {
            return Temporal.Instant.from(input).toZonedDateTimeISO(preferredTimezone);
        } catch {}

        // Try PlainDateTime.from (good for ISO strings without TZ/offset)
        try {
            return Temporal.PlainDateTime.from(input).toZonedDateTime(preferredTimezone);
        } catch {}

        // Try Date.parse (last resort for non-ISO legacy formats)
        const ms = Date.parse(input);
        if (!Number.isNaN(ms)) {
            return Temporal.Instant.fromEpochMilliseconds(ms).toZonedDateTimeISO(preferredTimezone);
        }

        throw new Error(`Failed to parse datetime: ${input}`);
    }

    if (input && typeof input === 'object') {
        if ('epochNanoseconds' in input) {
            return Temporal.Instant.fromEpochNanoseconds(input.epochNanoseconds).toZonedDateTimeISO(
                preferredTimezone
            );
        }
        if ('epochMilliseconds' in input) {
            return Temporal.Instant.fromEpochMilliseconds(
                input.epochMilliseconds
            ).toZonedDateTimeISO(preferredTimezone);
        }
    }

    throw new Error(`Unsupported input type for parseDatetime: ${typeof input}`);
}
