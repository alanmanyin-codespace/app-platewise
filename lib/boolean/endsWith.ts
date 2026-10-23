import { isEqual } from './isEqual';

export function endsWith(left: any, right: any, caseSensitive = false) {
    if (typeof left === 'string') {
        const leftValue = caseSensitive ? left : left.toLowerCase();
        const rightStr = String(right ?? '');
        const rightValue = caseSensitive ? rightStr : rightStr.toLowerCase();
        return leftValue.endsWith(rightValue);
    } else if (Array.isArray(left)) {
        if (Array.isArray(right)) {
            if (left.length < right.length) {
                return false;
            }
            for (let i = right.length - 1; i >= 0; i--) {
                if (!isEqual(left[i], right[i], caseSensitive)) {
                    return false;
                }
            }
            return true;
        } else {
            return isEqual(left[left.length - 1], right, caseSensitive);
        }
    } else {
        return false;
    }
}
