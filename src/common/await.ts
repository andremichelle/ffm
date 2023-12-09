// noinspection JSUnusedGlobalSymbols

import { Exec, int } from "./lang"

export namespace Await {
    export const frame = (): Promise<void> => new Promise(resolve => requestAnimationFrame(() => resolve()))
    export const frames = (numFrames: number): Promise<void> => new Promise(resolve => {
        let count = numFrames
        const callback = () => {if (--count <= 0) {resolve()} else {requestAnimationFrame(callback)}}
        requestAnimationFrame(callback)
    })
    export const millis = (millis: int): Promise<void> =>
        new Promise(resolve => setTimeout(resolve, millis))
    export const event = (target: EventTarget, type: string): Promise<void> =>
        new Promise<void>(resolve => target.addEventListener(type, resolve as Exec, { once: true }))
}