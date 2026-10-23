export type DateTimeLike =
    | string
    | number
    | Date
    | Temporal.Instant
    | Temporal.PlainDate
    | Temporal.PlainDateTime
    | Temporal.ZonedDateTime
    | { epochNanoseconds: bigint }
    | { epochMilliseconds: number };
