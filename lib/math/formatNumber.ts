export type Options = Intl.NumberFormatOptions & {
    locale?: string;
};

export type FormatNumber = (value?: number, options?: Options) => string;

export const formatNumber: FormatNumber = (value, { locale, ...options } = {}) => {
    if (value === undefined) {
        return '';
    }
    const formatter = new Intl.NumberFormat(locale, options);
    return formatter.format(value);
};
