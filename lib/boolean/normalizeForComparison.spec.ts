import { describe, it, expect } from 'vitest';
import { normalizeForComparison } from './normalizeForComparison';

describe('normalizeForComparison', () => {
    it('should normalize Temporal.ZonedDateTime to epochMilliseconds', () => {
        const date = Temporal.ZonedDateTime.from('2024-01-01T12:00:00[UTC]');
        const [left, right] = normalizeForComparison(date, date);
        expect(left).toBe(date.epochMilliseconds);
        expect(right).toBe(date.epochMilliseconds);
    });

    it('should normalize Temporal.Instant to epochMilliseconds', () => {
        const instant = Temporal.Instant.from('2024-01-01T12:00:00Z');
        const [left, right] = normalizeForComparison(instant, instant);
        expect(left).toBe(instant.epochMilliseconds);
        expect(right).toBe(instant.epochMilliseconds);
    });

    it('should normalize one Temporal and one string date', () => {
        const date = Temporal.ZonedDateTime.from('2024-01-01T12:00:00[UTC]');
        const dateStr = '2024-01-01T12:00:00Z';
        const [left, right] = normalizeForComparison(date, dateStr);
        expect(left).toBe(date.epochMilliseconds);
        expect(right).toBe(date.epochMilliseconds);
    });

    it('should normalize one string date and one Temporal', () => {
        const date = Temporal.ZonedDateTime.from('2024-01-01T12:00:00[UTC]');
        const dateStr = '2024-01-01T12:00:00Z';
        const [left, right] = normalizeForComparison(dateStr, date);
        expect(left).toBe(date.epochMilliseconds);
        expect(right).toBe(date.epochMilliseconds);
    });

    it('should normalize different Temporal types to epochMilliseconds', () => {
        const zdt = Temporal.ZonedDateTime.from('2024-01-01T12:00:00[UTC]');
        const instant = Temporal.Instant.from('2024-01-01T12:00:00Z');
        const [left, right] = normalizeForComparison(zdt, instant);
        expect(left).toBe(zdt.epochMilliseconds);
        expect(right).toBe(instant.epochMilliseconds);
    });

    it('should not normalize non-temporal values', () => {
        const [left, right] = normalizeForComparison(1, 2);
        expect(left).toBe(1);
        expect(right).toBe(2);
    });
});
