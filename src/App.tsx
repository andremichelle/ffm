import "./App.sass"
import { useEffect, useState } from "react"
import { FFmpegWorker, FileConversionResult } from "./ffmepg.ts"
import { int, unitValue } from "./common/lang"
import { Progress } from "./components/Progress"
import { Header } from "./components/Header"
import { FileSource } from "./components/FileSource.tsx"
import { ConversionResult } from "./components/ConversionResult"
import { forceDownload } from "./common/download.ts"

type State = ReadonlyArray<PromiseSettledResult<FileConversionResult>> | unitValue | string

const App = () => {
    const [ffmpeg, setFfmpeg] = useState<FFmpegWorker | unitValue>(0.0)
    const [files, setFiles] = useState<ReadonlyArray<File>>([])
    const [state, setState] = useState<State>("")

    const ffmpegLoaded = ffmpeg instanceof FFmpegWorker
    const conversionInProgress = typeof state === "number"

    useEffect(() => {
        (async () => setFfmpeg(await FFmpegWorker.load(progress => setFfmpeg(progress))))()
        const playEventListener = (event: Event) => {
            document.querySelectorAll("audio")
                .forEach(audio => {if (audio !== event.target) {audio.pause()}})
        }
        self.addEventListener("play", playEventListener, { capture: true })
        return () => {
            self.removeEventListener("play", playEventListener, { capture: true })
            if (ffmpegLoaded) {ffmpeg.terminate()}
        }
    }, [])

    useEffect(() => {
        if (ffmpegLoaded && files.length > 0) {
            (async () => setState(await ffmpeg.batch(files, progress => setState(progress))))()
        }
    }, [files, ffmpeg])

    return (
        <div>
            <h1>Convert Any Files With Audio To Wav</h1>
            <Header progress={ffmpegLoaded ? 1.0 : ffmpeg} />
            <FileSource
                disabled={!ffmpegLoaded || conversionInProgress}
                onChanged={files => {
                    setState(0.0)
                    setFiles(files)
                }} />
            {(() => {
                if (typeof state === "string") {
                    return state !== "" ?? <div className="error">{state}</div>
                } else if (conversionInProgress) {
                    return <Progress value={state}></Progress>
                } else if (!ffmpegLoaded || files.length === 0) {
                    // Idle. Waiting for input...
                    return
                } else {
                    return (
                        <>
                            {
                                state.reduce((count, result) => count + (result.status === "fulfilled" ? 1 : 0), 0) > 1
                                    ? <a className="download-all" href="#"
                                         onClick={() => document
                                             .querySelectorAll<HTMLAnchorElement>("a[download]")
                                             .forEach(anchor => forceDownload(anchor.href, anchor.download))}>
                                        download all</a> : null
                            }
                            <div className="conversion-results">
                                {state.map((state: PromiseSettledResult<FileConversionResult>, index: int) => {
                                    return <ConversionResult fileNameWithExtension={files[index].name} state={state}
                                                             key={index} />
                                })}
                            </div>
                        </>)
                }
            })()}
            <footer>
                <span>No Ads | No Tracking | No Bullshit</span>
                <span>andre.michelle[guess what]gmail.com</span>
                <span>powered by <a href="https://github.com/ffmpegwasm/" target="ffmpegwasm">ffmpegwasm</a></span>
                <span><a href="https://github.com/andremichelle/ffm/" target="ffmpegwasm">sourcecode</a></span>
            </footer>
        </div>)
}

export default App