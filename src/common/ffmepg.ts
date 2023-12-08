import { FFmpeg } from "@ffmpeg/ffmpeg"
import { fetchFile, toBlobURL } from "@ffmpeg/util"
import { LogEvent } from "@ffmpeg/ffmpeg/dist/esm/types"
import { DownloadProgressEvent } from "@ffmpeg/util/dist/esm/types"
import { Arrays } from "./arrays"
import { KeyValuePair, Nullable, unitValue } from "./lang"
import { Progress, ProgressHandler, SilentProgressHandler } from "./progress"
import { Notifier } from "./observers"
import { Lazy } from "./decorators"

export type FileConversionResult = { file_data: Uint8Array, meta_data: Array<KeyValuePair> }

export class FFmpegWorker {
    static #log: Array<string> = []

    static async preload(progress: ProgressHandler = SilentProgressHandler): Promise<FFmpegWorker> {
        return Loader.loadAndAttach(progress)
    }

    constructor(readonly ffmpeg: FFmpeg) {
        ffmpeg.on("log", ({ message }: LogEvent) => FFmpegWorker.#log.push(message))
        ffmpeg.on("progress", event => {console.debug(event.progress)})
    }

    static clearLogs(): void {Arrays.clear(FFmpegWorker.#log)}
    static consumeLogs(): Array<string> {return FFmpegWorker.#log.splice(0, FFmpegWorker.#log.length)}

    get loaded(): boolean {return this.ffmpeg.loaded}

    async info(file: string | File | Blob): Promise<string> {
        try {
            await this.ffmpeg.writeFile("temp", await fetchFile(file))
            await this.ffmpeg.exec(["-y", "-i", "temp", "-map", "a", "-c", "copy", "-f", "ffmetadata", "metadata.txt"])
            const data = await this.ffmpeg.readFile("metadata.txt")
            await this.ffmpeg.deleteFile("metadata.txt")
            return typeof data === "string" ? data : new TextDecoder().decode(data)
        } catch (reason) {
            console.warn(reason)
            return Promise.reject(reason)
        } finally {
            await this.ffmpeg.deleteFile("temp")
        }
    }

    async convert(file: string | File | Blob): Promise<FileConversionResult> {
        try {
            await this.ffmpeg.writeFile("temp.raw", await fetchFile(file))
            console.log("exec")
            await this.ffmpeg.exec([
                "-y",
                "-i", "temp.raw",
                "-map", "0", "-c", "copy", "-f", "ffmetadata", "metadata.txt",
                "-map", "0:a", "-vn", "-ar", "44100", "-ac", "2", "-b:a", "192k", "output.wav"
            ])
            const meta_data: Uint8Array | string = await this.ffmpeg.readFile("metadata.txt")
            if (typeof meta_data === "string") {
                return Promise.reject(meta_data)
            }
            const file_data: Uint8Array | string = await this.ffmpeg.readFile("output.wav")
            if (typeof file_data === "string") {
                return Promise.reject(file_data)
            }
            return { file_data, meta_data: this.#parseMetaData(meta_data) }
        } catch (reason) {
            console.warn(reason)
            return Promise.reject(reason)
        } finally {
            await this.ffmpeg.deleteFile("temp.raw")
            await this.ffmpeg.deleteFile("output.wav")
            await this.ffmpeg.deleteFile("metadata.txt")
        }
    }

    #parseMetaData(raw: Uint8Array): Array<KeyValuePair> {
        const string = new TextDecoder().decode(raw)
        console.log(string)
        return string
            .split("\n")
            .map(line => {
                const separatorIndex = line.indexOf("=")
                const key = line.substring(0, separatorIndex).trim()
                const value = line.substring(separatorIndex + 1).trim()
                console.log(">", line, "<")
                console.log(`key: '${key}', value: '${value}'`)
                return ({ key, value })
            })
            .filter(({ key, value }) => key !== "" && value !== "")
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
