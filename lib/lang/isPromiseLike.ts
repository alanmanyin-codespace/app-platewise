export function isPromiseLike(value: any): value is PromiseLike<any> {
    return value instanceof Promise || (!!value && typeof value.then === 'function');
}
