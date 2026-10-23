import { describe, it, expect } from 'vitest';

import { parseDateTime } from './parseDateTime';

describe('parseDateTime', () => {
    const tz = 'UTC';

    it('should parse number as milliseconds', () => {
        const ms = 1708953600000; // 2024-02-26T13:20:00Z
        const result = parseDateTime(ms, { preferredTimezone: tz });
        expect(result.epochMilliseconds).toBe(ms);
        expect(result.timeZoneId).toBe(tz);
    });

    it('should handle Date object', () => {
        const date = new Date(2024, 1, 26, 13, 20);
        const result = parseDateTime(date, { preferredTimezone: tz });
        expect(result.epochMilliseconds).toBe(date.getTime());
        expect(result.timeZoneId).toBe(tz);
    });

    it('should handle Temporal.Instant', () => {
        const instant = Temporal.Instant.from('2024-02-26T13:20:00Z');
        const result = parseDateTime(instant, { preferredTimezone: tz });
        expect(result.epochMilliseconds).toBe(instant.epochMilliseconds);
        expect(result.timeZoneId).toBe(tz);
    });

    it('should handle Temporal.ZonedDateTime', () => {
        const zdt = Temporal.ZonedDateTime.from('2024-02-26T13:20:00+01:00[Europe/Paris]');
        const result = parseDateTime(zdt);
        expect(result.equals(zdt)).toBe(true);
    });

    it('should handle Temporal.PlainDateTime', () => {
        const pdt = Temporal.PlainDateTime.from('2024-02-26T13:20:00');
        const result = parseDateTime(pdt, { preferredTimezone: tz });
        expect(result.toPlainDateTime().equals(pdt)).toBe(true);
        expect(result.timeZoneId).toBe(tz);
    });

    it('should handle an object like Temporal.Instant with milliseconds', () => {
        const instant = { epochMilliseconds: 1708953600000 };
        const result = parseDateTime(instant);
        expect(result.epochMilliseconds).toBe(instant.epochMilliseconds);
    });

    it('should handle an object like Temporal.Instant with nanosecond', () => {
        const instant = { epochNanoseconds: 1708953600000000000n };
        const result = parseDateTime(instant);
        expect(result.epochNanoseconds).toBe(instant.epochNanoseconds);
    });

    describe('string parsing', () => {
        it('should parse ISO string with timezone', () => {
            const str = '2024-02-26T13:20:00+01:00[Europe/Paris]';
            const result = parseDateTime(str);
            expect(result.toString()).toBe(str);
        });

        it('should parse ISO string with offset (Instant)', () => {
            const str = '2024-02-26T13:20:00Z';
            const result = parseDateTime(str, { preferredTimezone: 'America/New_York' });
            expect(result.epochMilliseconds).toBe(Temporal.Instant.from(str).epochMilliseconds);
            expect(result.timeZoneId).toBe('America/New_York');
        });

        it('should parse ISO string without timezone/offset (PlainDateTime)', () => {
            const str = '2024-02-26T13:20:00';
            const result = parseDateTime(str, { preferredTimezone: 'Europe/London' });
            expect(result.toPlainDateTime().toString()).toBe(str);
            expect(result.timeZoneId).toBe('Europe/London');
        });

        it('should parse legacy date strings using Date.parse', () => {
            const str = 'Feb 26, 2024 13:20:00';
            const result = parseDateTime(str, { preferredTimezone: 'UTC' });
            const expectedMs = Date.parse(str);
            expect(result.epochMilliseconds).toBe(expectedMs);
        });

        it('should throw error for invalid string', () => {
            expect(() => parseDateTime('invalid-date')).toThrow('Failed to parse datetime');
        });
    });

    it('should use default timezone from Temporal.Now.timeZoneId()', () => {
        const ms = 1708953600000;
        const result = parseDateTime(ms);
        expect(result.timeZoneId).toBe(Temporal.Now.timeZoneId());
    });
});
