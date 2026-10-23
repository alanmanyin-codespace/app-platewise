// normalize for comparison

import { parseDateTime } from '../datetime/parseDateTime';

export function normalizeForComparison(left: any, right: any): [any, any] {
    // detect temporal types
    const leftIsTemporal = isTemporalWithEpochMilliseconds(left);
    const rightIsTemporal = isTemporalWithEpochMilliseconds(right);

    // try to coerce left or right to Temporal.ZonedDateTime
    if (leftIsTemporal && !rightIsTemporal) {
        try {
            right = parseDateTime(right, {
                preferredTimezone:
                    left instanceof Temporal.ZonedDateTime ? left.timeZoneId : undefined
            });
        } catch {}
    } else if (!leftIsTemporal && rightIsTemporal) {
        try {
            left = parseDateTime(left, {
                preferredTimezone:
                    right instanceof Temporal.ZonedDateTime ? right.timeZoneId : undefined
            });
        } catch {}
    }

    // finally, coerce to epoch milliseconds
    if (isTemporalWithEpochMilliseconds(left)) {
        left = left.epochMilliseconds;
    }
    if (isTemporalWithEpochMilliseconds(right)) {
        right = right.epochMilliseconds;
    }

    return [left, right];
}

function isTemporalWithEpochMilliseconds(
    value: any
): value is Temporal.Instant | Temporal.ZonedDateTime {
    return value instanceof Temporal.Instant || value instanceof Temporal.ZonedDateTime;
}
