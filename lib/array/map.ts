import { isPromiseLike } from '../lang/isPromiseLike';

export function map<TInput = any, TOutput = any>(
    list: TInput[],
    iterator: (item: TInput, index: number, list: TInput[]) => TOutput
): TOutput extends Promise<infer TResult> ? Promise<TResult[]> : TOutput[] {
    if (!Array.isArray(list) || !iterator) {
        return [] as TOutput[] as any;
    }

    const iteratorResults: Array<TOutput | Promise<TOutput>> = [];
    const isIteratorFunction = typeof iterator === 'function';

    let hasPromise = false;
    for (let index = 0; index < list.length; index++) {
        const result = isIteratorFunction ? iterator(list[index], index, list) : iterator;
        if (isPromiseLike(result)) {
            hasPromise = true;
        }
        iteratorResults[index] = result;
    }

    if (hasPromise) {
        return Promise.all(iteratorResults).then((results) =>
            list.map((_, index) => results[index])
        ) as Promise<TOutput[]> as any;
    } else {
        return list.map((_, index) => iteratorResults[index]) as TOutput[] as any;
    }
}
