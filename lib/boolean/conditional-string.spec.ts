import { describe, expect, it } from 'vitest';
import { conditional } from './conditional';

describe('conditional display-label comparisons', () => {
    it('compares unquoted labels used by generated UI styles', () => {
        expect(conditional([{ condition: 'All Stores = All Stores', value: 'selected' }], 'default')).toBe('selected');
        expect(conditional([{ condition: 'Metro = All Stores', value: 'selected' }], 'default')).toBe('default');
    });
});
