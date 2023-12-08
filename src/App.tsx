import "./App.sass"
import { useEffect, useState } from "react"
import { FFmpegWorker, FileConversionResult } from "./common/ffmepg.ts"
import { unitValue } from "./common/lang.ts"
import { Progress } from "./Progress.tsx"
import { Header } from "./Header.tsx"
import { FileSource } from "./common/FileSource.tsx"
import { ConversionResult } from "./ConversionResult.tsx"

const App = () => {
    const [ffmpeg, setFfmpeg] = useState<FFmpegWorker | unitValue>(0.0)
    const [files, setFiles] = useState<ReadonlyArray<File>>([])
    const [state, setState] = useState<FileConversionResult | unitValue | string>("")

    const ffmpegLoaded = ffmpeg instanceof FFmpegWorker
    const conversionInProgress = typeof state === "number"

    useEffect(() => {
        (async () => setFfmpeg(await FFmpegWorker.preload(progress => setFfmpeg(progress))))()
        return () => {
            if (ffmpegLoaded) {ffmpeg.terminate()}
        }
    }, [])

    useEffect(() => {
        if (ffmpegLoaded && files.length > 0) {
            (async () => {
                let result: FileConversionResult
                try {
                    result = await ffmpeg.convert(files[0], progress => setState(progress))
                } catch (reason) {
                    setState(`Unrecognised audio format (${files[0].name})`)
                    setFiles([])
                    return
                }
                setState(result)
            })()
        }
    }, [files, ffmpeg])

    return (
        <>
            <h1>Convert Any Audio File To Wav</h1>
            <Header progress={ffmpegLoaded ? 1.0 : ffmpeg} />
            <FileSource
                disabled={!ffmpegLoaded || conversionInProgress}
                onChanged={files => {
                    setState(0.0)
                    setFiles(files)
                }} />
            {(() => {
                if (typeof state === "string") {
                    return <div className="error">{state}</div>
                } else if (conversionInProgress) {
                    return <Progress value={state}></Progress>
                } else if (!ffmpegLoaded || files.length === 0) {
                    // Idle. Waiting for input...
                    return
                } else {
                    const name = (() => {
                        const path = files[0].name
                        return path.substring(0, path.lastIndexOf("."))
                    })()
                    return <ConversionResult name={name} state={state} />
                }
            })()}
        </>
    )
}

export default App