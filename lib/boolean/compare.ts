import { contains } from './contains';
import { endsWith } from './endsWith';
import { isEqual } from './isEqual';
import { normalizeForComparison } from './normalizeForComparison';
import { startsWith } from './startsWith';

export type CompareNoOptions = never;

export type CompareStringOptions = {
    caseSensitive?: boolean;
};

export type ComparatorOptions = {
    contains: CompareStringOptions; // string or array
    notContains: CompareStringOptions; // string or array
    equals: CompareStringOptions; // any
    notEquals: CompareStringOptions; // any
    startsWith: CompareStringOptions; //string or array
    notStartsWith: CompareStringOptions; // string or array
    endsWith: CompareStringOptions; // string or array
    notEndsWith: CompareStringOptions; // string or array
    greaterThanOrEqual: CompareNoOptions; // number, percent or size
    greaterThan: CompareNoOptions; // number, percent or size
    lessThanOrEqual: CompareNoOptions; // number, percent or size
    lessThan: CompareNoOptions; // number, percent or size
};

export const CASE_SENSITIVE_COMPARATORS: Array<keyof ComparatorOptions> = [
    'contains',
    'notContains',
    'equals',
    'notEquals',
    'startsWith',
    'notStartsWith',
    'endsWith',
    'notEndsWith'
];

export type Compare = <T extends keyof ComparatorOptions>(
    left: any,
    right: any,
    comparator?: T,
    options?: ComparatorOptions[T]
) => boolean;

export const compare: Compare = (left, right, comparator, options) => {
    const actualComparator = comparator ?? 'equals';
    [left, right] = normalizeForComparison(left, right);

    if (actualComparator === 'equals') {
        return isEqual(left, right, options?.caseSensitive);
    } else if (actualComparator === 'notEquals') {
        return !isEqual(left, right, options?.caseSensitive);
    } else if (actualComparator === 'contains') {
        return contains(left, right, options?.caseSensitive);
    } else if (actualComparator === 'notContains') {
        return !contains(left, right, options?.caseSensitive);
    } else if (actualComparator === 'startsWith') {
        return startsWith(left, right, options?.caseSensitive);
    } else if (actualComparator === 'notStartsWith') {
        return !startsWith(left, right, options?.caseSensitive);
    } else if (actualComparator === 'endsWith') {
        return endsWith(left, right, options?.caseSensitive);
    } else if (actualComparator === 'notEndsWith') {
        return !endsWith(left, right, options?.caseSensitive);
    } else if (actualComparator === 'greaterThan') {
        return Number(left) > Number(right);
    } else if (actualComparator === 'greaterThanOrEqual') {
        return Number(left) >= Number(right);
    } else if (actualComparator === 'lessThan') {
        return Number(left) < Number(right);
    } else if (actualComparator === 'lessThanOrEqual') {
        return Number(left) <= Number(right);
    } else {
        return false;
    }
};
