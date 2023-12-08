// noinspection JSUnusedGlobalSymbols

import { asDefined, Func, int, Nullable, panic, Predicate } from "./lang"
import { Terminable } from "./terminable.ts"

export type NumberArray =
    ReadonlyArray<number>
    | Float32Array
    | Float64Array
    | Uint8Array
    | Int8Array
    | Uint16Array
    | Int16Array
    | Uint32Array
    | Int32Array

export const enum Sorting {Ascending = 1, Descending = -1}

export class Arrays {
    static readonly #EMPTY: ReadonlyArray<never> = Object.freeze(new Array<never>(0))

    static readonly empty = <T>(): ReadonlyArray<T> => Arrays.#EMPTY
    static readonly clear = <T>(array: Array<T>): void => {array.splice(0, array.length)}
    static readonly peekFirst = <T>(array: ReadonlyArray<T>): Nullable<T> => array.at(0) ?? null
    static readonly peekLast = <T>(array: ReadonlyArray<T>): Nullable<T> => array.at(-1) ?? null
    static readonly getFirst = <T>(array: ReadonlyArray<T>, fail: string): T => asDefined(array.at(0), fail)
    static readonly getLast = <T>(array: ReadonlyArray<T>, fail: string): T => asDefined(array.at(-1), fail)
    static readonly create = <T>(factory: Func<int, T>, n: int): Array<T> => {
        const array: T[] = new Array<T>(n)
        for (let i: int = 0; i < n; i++) {array[i] = factory(i)}
        return array
    }

    static readonly remove = <T>(array: Array<T>, element: T): void => {
        const index: int = array.indexOf(element)
        if (index === -1) {return panic(`${element} not found in ${array}`)}
        array.splice(index, 1)
    }

    static readonly removeDuplicates = <T>(array: Array<T>): Array<T> => {
        let index = 0 | 0
        const result = new Set<T>()
        for (const element of array) {
            if (!result.has(element)) {
                result.add(element)
                array[index++] = element
            }
        }
        array.length = index
        return array
    }

    static readonly removeByPredicate = <T>(array: Array<T>, predicate: Predicate<T>): ReadonlyArray<T> => {
        const removed: Array<T> = []
        let index: int = array.length
        while (--index >= 0) {if (predicate(array[index])) {removed.push(...array.splice(index, 1))}}
        return removed.reverse()
    }

    static readonly filterByPredicate = <T>(array: ReadonlyArray<T>,
                                            predicate: (a: T, b: T) => boolean): ReadonlyArray<T> => {
        if (array.length < 2) {return Arrays.empty()}
        const set: Set<T> = new Set<T>()
        for (let i: int = 0; i < array.length; i++) {
            for (let j: int = i + 1; j < array.length; j++) {
                const a: T = array[i]
                const b: T = array[j]
                if (predicate(a, b)) {
                    set.add(a)
                    set.add(b)
                }
            }
        }
        return set.size > 0 ? Array.from(set) : Arrays.empty()
    }

    static readonly pushTerminable = <T>(array: Array<T>, element: T): Terminable => {
        let terminated = false
        array.push(element)
        return {
            terminate: (): void => {
                if (terminated) {return}
                const index: int = array.indexOf(element)
                if (index > -1) {
                    array.splice(index, 1)
                    terminated = true
                } else {
                    return panic(`${element} is not in list`)
                }
            }
        }
    }

    static* iterateReverse<T>(array: ArrayLike<T>): Generator<T> {
        for (let i: int = array.length - 1; i >= 0; i--) {
            yield array[i]
        }
    }

    static* iterateStateFull<T>(array: ArrayLike<T>): Generator<{ value: T, isFirst: boolean, isLast: boolean }> {
        const maxIndex = array.length - 1
        for (let i: int = 0; i <= maxIndex; i++) {
            yield { value: array[i], isFirst: i === 0, isLast: i === maxIndex }
        }
    }

    static isSorted<ARRAY extends NumberArray>(array: ARRAY, sorting: Sorting = Sorting.Ascending): boolean {
        if (array.length < 2) return true
        let prev: number = array[0]
        for (let i: int = 1; i < array.length; i++) {
            const next: number = array[i]
            if (Math.sign(prev - next) === sorting) return false
            prev = next
        }
        return true
    }

    static compareArrayBuffers(a: ArrayBuffer, b: ArrayBuffer): boolean {
        if (a.byteLength !== b.byteLength) {return false}
        const va: DataView = new DataView(a)
        const vb: DataView = new DataView(b)
        for (let i: int = 0 | 0; i < a.byteLength; i++) {
            if (va.getUint8(i) !== vb.getUint8(i)) {return false}
        }
        return true
    }
}