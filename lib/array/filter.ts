import { isPromiseLike } from '../lang/isPromiseLike';

export type Filter<
    Item = any,
    Iterator extends FuncIterator<Item> | undefined | boolean =
        FuncIterator<Item> | undefined | boolean
> = (
    list: Item[],
    iterator: Iterator
) => Iterator extends FuncIterator<Item>
    ? ReturnType<Iterator> extends Promise<boolean>
        ? Promise<Item[]>
        : Item[]
    : Item[];

type FuncIterator<Item> = (item: Item, index: number, list: Item[]) => boolean | Promise<boolean>;

export const filter: Filter = (list, iterator) => {
    if (!Array.isArray(list) || !iterator) {
        return [];
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
        return Promise.all(iteratorResults).then((results) =>
            list.filter((_, index) => results[index])
        );
    } else {
        return list.filter((_, index) => iteratorResults[index]) as any;
    }
};
