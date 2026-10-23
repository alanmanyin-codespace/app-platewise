export type Concat = (...args: any[]) => any[];

export const concat: Concat = (...args) => {
    const result: any[] = [];

    for (const arg of args) {
        if (Array.isArray(arg)) {
            result.push(...arg);
        } else {
            result.push(arg);
        }
    }

    return result;
};
