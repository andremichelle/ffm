import React, { ChangeEvent, useEffect, useState } from "react"
import { FFmpegWorker, FileConversionResult } from "./common/ffmepg.ts"
import { int, KeyValuePair, Nullable, unitValue } from "./common/lang.ts"
import "./App.sass"
import { Progress } from "./Progress.tsx"

const App = () => {
    const [ffmpeg, setFfmpeg] = useState<Nullable<FFmpegWorker>>(null)
    const [ffmpegLoadingProgress, setFfmpegLoadingProgress] = useState(0.0)

    const [files, setFiles] = useState<ReadonlyArray<File>>([])
    const [conversationState, setConversationState] = useState<FileConversionResult | unitValue | string>("N/A")

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        setConversationState("processing...")
        setFiles([...event.target.files ?? []])
    }

    useEffect(() => {
        (async () => setFfmpeg(await FFmpegWorker.preload(progress => setFfmpegLoadingProgress(progress))))()
        return () => ffmpeg?.terminate()
    }, [])

    useEffect(() => {
        if (ffmpeg !== null && files.length > 0) {
            (async () => {
                let result: FileConversionResult
                try {
                    result = await ffmpeg.convert(files[0], progress => setConversationState(progress))
                } catch (reason) {
                    setConversationState("Unrecognised audio format")
                    return
                }
                setConversationState(result)
            })()
        }
    }, [files, ffmpeg])

    return (
        <>
            <header>
                <div>
                    <div>FFMPEG</div>
                    <img src="ffmpeg.wasm.png" alt="logo" />
                    <Progress className={ffmpeg === null ? "blink" : ""} value={ffmpegLoadingProgress} />
                </div>
            </header>
            <h1>Quickly Convert Any Audio File To Wav</h1>
            <label htmlFor="myfile" />
            <input type="file" id="myfile" name="myfile" multiple={true} onChange={handleChange}
                   disabled={ffmpeg === null} />
            {(() => {
                if (ffmpeg === null) {
                    return <p>waiting for ffmpeg</p>
                }
                if (files.length === 0) {
                    return <p>Please select a file</p>
                }
                if (typeof conversationState === "string") {
                    return <div>Conversation Result: {conversationState}</div>
                }
                if (typeof conversationState === "number") {
                    return <progress value={conversationState} max={1.0}></progress>
                }
                const objectURL = URL.createObjectURL(new Blob([conversationState.file_data], { type: "audio/wav" }))
                const fileName = (() => {
                    const path = files[0].name
                    return path.substring(0, path.lastIndexOf("."))
                })()
                return (
                    <div>
                        <div className="file-info">{
                            conversationState.meta_data.map((pair: KeyValuePair, index: int) =>
                                <React.Fragment key={pair.key + index}>
                                    <span>{pair.key}</span>
                                    <span>{pair.value}</span>
                                </React.Fragment>)}
                        </div>
                        <audio controls src={objectURL}></audio>
                        <br />
                        <a href={objectURL} download={`${fileName}.wav`}>{`Download ${fileName}.wav`}</a>
                    </div>
                )
            })()}
        </>
    )
}

export default App