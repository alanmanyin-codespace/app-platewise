export type Join = (
    list?: any | any[],
    params?: {
        locale?: string;
        type?: 'conjunction' | 'disjunction' | 'unit' | 'separator';
        style?: 'long' | 'short' | 'narrow';
        separator?: string;
    }
) => string;

export const join: Join = (list, params = {}) => {
    if (!Array.isArray(list)) {
        return '';
    }

    if (list.length === 0) {
        return '';
    }

    const { locale = 'en', type, style = 'long', separator = '' } = params;

    // Convert all items to strings
    const stringItems = list.map((item) => {
        if (item === null || item === undefined) {
            return '';
        }
        return String(item);
    });

    // Use Array.join() for separator type
    if (type === 'separator') {
        return stringItems.join(separator);
    }

    // Use Intl.ListFormat for conjunction, disjunction, and unit
    try {
        const formatter = new Intl.ListFormat(locale, {
            type: type || 'conjunction',
            style
        });
        return formatter.format(stringItems);
    } catch {
        // Fallback to simple join if Intl.ListFormat fails
        return stringItems.join(separator);
    }
};
