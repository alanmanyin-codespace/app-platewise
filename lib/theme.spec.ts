import { describe, expect, it } from 'vitest';
import { theme } from './theme';

describe('app theme', () => {
    it('uses a green primary palette for the savings experience', () => {
        expect(theme.colors.primary).toBe('#2D6A5B');
        expect(theme.colors.primarySoft).toBe('#EEF5F1');
        expect(theme.colors.background).toBe('#FFFFFF');
    });
});
