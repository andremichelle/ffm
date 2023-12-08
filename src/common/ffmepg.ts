// noinspection JSUnusedGlobalSymbols

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { LogEvent } from "@ffmpeg/ffmpeg/dist/esm/types"
import { DownloadProgressEvent } from "@ffmpeg/util/dist/esm/types"
import { Arrays } from "./arrays"
import { KeyValuePair, Nullable, unitValue } from "./lang"
import { Progress, ProgressHandler, SilentProgressHandler } from "./progress"
import { Notifier } from "./observers"
import { Lazy } from "./decorators"
import { Terminable } from "./terminable.ts"

export type FileConversionResult = { file_data: Uint8Array, meta_data: Array<KeyValuePair> }

export class FFmpegWorker implements Terminable {
    static #log: Array<string> = []

    static async preload(progress: ProgressHandler = SilentProgressHandler): Promise<FFmpegWorker> {
        return Loader.loadAndAttach(progress)
    }

    static clearLogs(): void {Arrays.clear(FFmpegWorker.#log)}
    static consumeLogs(): Array<string> {return FFmpegWorker.#log.splice(0, FFmpegWorker.#log.length)}

    readonly #ffmpeg: FFmpeg
    readonly #progressNotifier: Notifier<unitValue>

    constructor(ffmpeg: FFmpeg) {
        this.#ffmpeg = ffmpeg
        this.#progressNotifier = new Notifier<unitValue>()

        this.#ffmpeg.on("log", ({ message }: LogEvent) => FFmpegWorker.#log.push(message))
        this.#ffmpeg.on("progress", event => this.#progressNotifier.notify(event.progress))
    }

    get loaded(): boolean {return this.#ffmpeg.loaded}

    async convert(file: string | File | Blob, progressHandler: ProgressHandler = SilentProgressHandler): Promise<FileConversionResult> {
        const subscription = this.#progressNotifier.subscribe(progressHandler)
        try {
            await this.#ffmpeg.writeFile("temp.raw", await fetchFile(file))
            await this.#ffmpeg.exec([
                "-y",
                "-i", "temp.raw",
                "-f", "ffmetadata", "metadata.txt",
                "-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k", "output.wav"
            ])
            const meta_data: Uint8Array | string = await this.#ffmpeg.readFile("metadata.txt")
            if (typeof meta_data === "string") {
                return Promise.reject(meta_data)
            }
            const file_data: Uint8Array | string = await this.#ffmpeg.readFile("output.wav")
            if (typeof file_data === "string") {
                return Promise.reject(file_data)
            }
            return { file_data, meta_data: this.#parseMetaData(meta_data) }
        } catch (reason) {
            console.warn(reason)
            return Promise.reject(reason)
        } finally {
            subscription.terminate()
            await this.#ffmpeg.deleteFile("temp.raw")
            await this.#ffmpeg.deleteFile("output.wav")
            await this.#ffmpeg.deleteFile("metadata.txt")
        }
    }

    terminate(): void {this.#ffmpeg.terminate()}

    #parseMetaData(raw: Uint8Array): Array<KeyValuePair> {
        return new TextDecoder().decode(raw)
            .split("\n")
            .map(line => {
                const separatorIndex = line.indexOf("=")
                const key = line.substring(0, separatorIndex).trim()
                const value = line.substring(separatorIndex + 1).trim()
                return ({ key, value })
            })
            .filter(({ key, value }) => key !== "" && value !== "" && !IgnoreKeys.includes(key))
    }
}

class Loader {
    static async loadAndAttach(progress: ProgressHandler = SilentProgressHandler): Promise<FFmpegWorker> {
        if (this.#loader === null) {
            this.#loader = new Loader()
        }
        const subscription = this.#loader.#progressNotifier.subscribe(progress)
        return this.#loader.load().finally(() => subscription.terminate())
    }

    static #loader: Nullable<Loader> = null

    readonly #progressNotifier = new Notifier<unitValue>()

    @Lazy
    async load(): Promise<FFmpegWorker> {
        console.debug("FFmpeg loading...")
        const baseURL = "ffmpeg@0.12.4"
        const ffmpeg = new FFmpeg()
        const progressHandlers = Progress
            .split((progress: unitValue): void => this.#progressNotifier.notify(progress), 3)
            .map((progress: ProgressHandler) =>
                (event: DownloadProgressEvent) => progress(event.received / event.total))
        const [coreURL, wasmURL, workerURL] = await Promise.all([
            toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript", true, progressHandlers[0]),
            toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm", true, progressHandlers[1]),
            toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, "text/javascript", true, progressHandlers[2])
        ])
        return ffmpeg.load({ coreURL, wasmURL, workerURL }).then(success => {
            if (!success) {return Promise.reject("Could not load FFmpeg")}
            console.debug("FFmpeg successfully loaded")
            return new FFmpegWorker(ffmpeg)
        })
    }
}

// ffmpeg has terrible meta_data formatting and also outputs less interesting values
const IgnoreKeys: ReadonlyArray<string> = [
    "major_brand", "minor_version", "compatible_brands", "iTunSMPB", "vendor_id", "language", "umid"
] as const