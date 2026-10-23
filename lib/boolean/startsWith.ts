import { isEqual } from './isEqual';

export function startsWith(left: any, right: any, caseSensitive = false) {
    if (typeof left === 'string') {
        const leftValue = caseSensitive ? left : left.toLowerCase();
        const rightStr = String(right ?? '');
        const rightValue = caseSensitive ? rightStr : rightStr.toLowerCase();
        return leftValue.startsWith(rightValue);
    } else if (Array.isArray(left)) {
        if (Array.isArray(right)) {
            if (left.length < right.length) {
                return false;
            }
            for (let i = 0; i < right.length; i++) {
                if (!isEqual(left[i], right[i], caseSensitive)) {
                    return false;
                }
            }
            return true;
        } else {
            return isEqual(left[0], right, caseSensitive);
        }
    } else {
        return false;
    }
}
