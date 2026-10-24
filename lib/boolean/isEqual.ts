import { normalizeForComparison } from './normalizeForComparison';

export function isEqual(left: any, right: any, caseSensitive = false): boolean {
    [left, right] = normalizeForComparison(left, right);

    if (typeof left === 'string' || typeof right === 'string') {
        const leftStr = String(left ?? '');
        const leftValue = caseSensitive ? leftStr : leftStr.toLowerCase();
        const rightStr = String(right ?? '');
        const rightValue = caseSensitive ? rightStr : rightStr.toLowerCase();
        return leftValue === rightValue;
    } else if (Array.isArray(left)) {
        if (Array.isArray(right)) {
            return (
                left.length === right.length &&
                left.every((leftItem, index) => isEqual(leftItem, right[index], caseSensitive))
            );
        } else {
            return false;
        }
    } else if (left !== null && right !== null && typeof left === 'object' && typeof right === 'object') {
        const leftKeys = Object.keys(left);
        const rightKeys = Object.keys(right);
        if (leftKeys.length !== rightKeys.length) {
            return false;
        }
        return leftKeys.every((key) => isEqual(left[key], right[key], caseSensitive));
    } else {
        return left === right;
    }
}
