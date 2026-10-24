import { isEqual } from './isEqual';

export function contains(left: any, right: any, caseSensitive = false): boolean {
    if (typeof left === 'string') {
        const leftValue = caseSensitive ? left : left.toLowerCase();
        const rightStr = String(right ?? '');
        const rightValue = caseSensitive ? rightStr : rightStr.toLowerCase();
        return leftValue.includes(rightValue);
    } else if (Array.isArray(left)) {
        return left.some((item) => isEqual(item, right, caseSensitive));
    } else if (left !== null && typeof left === 'object') {
        if (right !== null && typeof right === 'object') {
            return Object.keys(right).every(
                (rightKey) =>
                    rightKey in left && isEqual(left[rightKey], right[rightKey], caseSensitive)
            );
        } else {
            return Object.values(left).some(
                (value, key) =>
                    isEqual(value, right, caseSensitive) || isEqual(key, right, caseSensitive)
            );
        }
    } else {
        return false;
    }
}
