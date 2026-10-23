export function createSafeFunction<TArgs extends any[], TReturn>(fn: (...args: TArgs) => TReturn) {
    return function (...args: TArgs): TReturn | undefined {
        try {
            return fn(...args);
        } catch (error) {
            console.error(error);
            return undefined;
        }
    };
}
