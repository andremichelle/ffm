// noinspection JSUnusedGlobalSymbols

import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { LogEvent } from "@ffmpeg/ffmpeg/dist/esm/types"
import { DownloadProgressEvent } from "@ffmpeg/util/dist/esm/types"
import { Arrays } from "./common/arrays.ts"
import { KeyValuePair, Nullable, unitValue } from "./common/lang.ts"
import { Progress, ProgressHandler, SilentProgressHandler } from "./common/progress.ts"
import { Notifier } from "./common/observers.ts"
import { Lazy } from "./common/decorators.ts"
import { Terminable } from "./common/terminable.ts"

// url string, base64, File or Blob
export type AcceptedSource = string | File | Blob
export type FileConversionResult = { file_data: Blob, meta_data: Array<KeyValuePair> }

export class FFmpegWorker implements Terminable {
    static #log: Array<string> = []

    static async load(progress: ProgressHandler = SilentProgressHandler): Promise<FFmpegWorker> {
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

    async batch(sources: ReadonlyArray<AcceptedSource>,
                progressHandler: ProgressHandler = SilentProgressHandler)
        : Promise<ReadonlyArray<PromiseSettledResult<FileConversionResult>>> {
        const result: Array<PromiseSettledResult<FileConversionResult>> = new Array(sources.length)
        const totalProgress = Progress.split(progressHandler, sources.length)
        for (const [index, file] of sources.entries()) {
            try {
                result[index] = { status: "fulfilled", value: await this.convert(file, totalProgress[index]) }
            } catch (reason) {
                result[index] = { status: "rejected", reason: reason }
            }
        }
        return result
    }

    // if we want to make it adjustable
    // sample-rate: "-ar", "44100"
    // num-channels: "-ac", "2"
    // -sample_fmt: "fltp", "s16le"

    async convert(source: AcceptedSource,
                  progressHandler: ProgressHandler = SilentProgressHandler): Promise<FileConversionResult> {
        const subscription = this.#progressNotifier.subscribe(progressHandler)
        try {
            await this.#ffmpeg.writeFile("temp.raw", await fetchFile(source))
            await this.#ffmpeg.exec([
                "-y",
                "-i", "temp.raw",
                "-f", "ffmetadata", "metadata.txt",
                "-vn",
                "output.wav"
            ])
            const meta_data: Uint8Array | string = await this.#ffmpeg.readFile("metadata.txt")
            if (typeof meta_data === "string") {
                return Promise.reject(meta_data)
            }
            const file_data: Uint8Array | string = await this.#ffmpeg.readFile("output.wav")
            if (typeof file_data === "string") {
                return Promise.reject(file_data)
            }
            return {
                file_data: new Blob([file_data], { type: "audio/wav" }),
                meta_data: this.#parseMetaData(meta_data)
            }
        } catch (reason) {
            throw reason
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
            .filter(({ key, value }) =>
                key !== "" && value !== "" && !IgnoreKeys.includes(key) && !key.startsWith("id3v"))
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
        const baseURL = "ffmpeg@0.12.4"
        console.debug(`${baseURL} loading...`)
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
            console.debug(`${baseURL} successfully loaded`)
            return new FFmpegWorker(ffmpeg)
        })
    }
}

// ffmpeg has terrible meta_data formatting and also outputs less interesting values
const IgnoreKeys: ReadonlyArray<string> = [
    "major_brand", "minor_version", "compatible_brands", "iTunSMPB", "vendor_id", "language", "umid"
] as const