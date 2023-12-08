import "./App.sass"
import { useEffect, useState } from "react"
import { FFmpegWorker, FileConversionResult } from "./common/ffmepg"
import { unitValue } from "./common/lang"
import { Progress } from "./components/Progress"
import { Header } from "./components/Header"
import { FileSource } from "./components/FileSource.tsx"
import { ConversionResult } from "./components/ConversionResult"

const App = () => {
    const [ffmpeg, setFfmpeg] = useState<FFmpegWorker | unitValue>(0.0)
    const [files, setFiles] = useState<ReadonlyArray<File>>([])
    const [conversationState, setConversationState] = useState<FileConversionResult | unitValue | string>("")

    const ffmpegLoaded = ffmpeg instanceof FFmpegWorker
    const conversionInProgress = typeof conversationState === "number"

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
                    result = await ffmpeg.convert(files[0], progress => setConversationState(progress))
                } catch (reason) {
                    setConversationState(`Unrecognised audio format (${files[0].name})`)
                    setFiles([])
                    return
                }
                setConversationState(result)
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
                    setConversationState(0.0)
                    setFiles(files)
                }} />
            {(() => {
                if (typeof conversationState === "string") {
                    return <div className="error">{conversationState}</div>
                } else if (conversionInProgress) {
                    return <Progress value={conversationState}></Progress>
                } else if (!ffmpegLoaded || files.length === 0) {
                    // Idle. Waiting for input...
                    return
                } else {
                    const name = (() => {
                        const path = files[0].name
                        return path.substring(0, path.lastIndexOf("."))
                    })()
                    return <ConversionResult name={name} state={conversationState} />
                }
            })()}
            <footer>Just a finger-exercise to learn REACT</footer>
        </>
    )
}

export default App