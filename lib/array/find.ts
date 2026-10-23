import { isPromiseLike } from '../lang/isPromiseLike';

export type Find<
    Item = any,
    Iterator extends FuncIterator<Item> | undefined | boolean =
        FuncIterator<Item> | undefined | boolean
> = (
    list: Item[],
    iterator: Iterator
) => Iterator extends FuncIterator<Item>
    ? ReturnType<Iterator> extends Promise<boolean>
        ? Promise<Item | undefined>
        : Item | undefined
    : Item | undefined;

export type FuncIterator<Item> = (
    item: Item,
    index: number,
    list: Item[]
) => boolean | Promise<boolean>;

export const find: Find = (list, iterator) => {
    if (!Array.isArray(list) || !iterator) {
        return undefined;
    }

    const iteratorResults: any[] = [];
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
        return Promise.all(iteratorResults).then((results) => {
            const foundIndex = results.findIndex((result) => result);
            return foundIndex !== -1 ? list[foundIndex] : undefined;
        });
    } else {
        const foundIndex = iteratorResults.findIndex((result) => result);
        return foundIndex !== -1 ? list[foundIndex] : undefined;
    }
};
