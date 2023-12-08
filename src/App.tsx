import React, { useEffect, useState } from "react"
import { FFmpegWorker, FileConversionResult } from "./common/ffmepg.ts"
import { int, KeyValuePair, unitValue } from "./common/lang.ts"
import "./App.sass"
import { Progress } from "./Progress.tsx"
import { Header } from "./Header.tsx"

const App = () => {
    const [ffmpeg, setFfmpeg] = useState<FFmpegWorker | unitValue>(0.0)

    const [files, setFiles] = useState<ReadonlyArray<File>>([])
    const [conversationState, setConversationState] = useState<FileConversionResult | unitValue | string>("")

    const ffmpegLoaded = ffmpeg instanceof FFmpegWorker

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
            <h1>Quickly Convert Any Audio File To Wav</h1>
            <Header progress={ffmpegLoaded ? 1.0 : ffmpeg} />
            <fieldset disabled={!ffmpegLoaded || typeof conversationState === "number"}>
                <label className="file"
                       onDragOver={event => {
                           event.currentTarget.classList.add("dragover")
                           event.preventDefault()
                       }}
                       onDragLeave={(event: React.DragEvent<HTMLLabelElement>) => {
                           event.currentTarget.classList.remove("dragover")
                       }}
                       onDrop={event => {
                           event.preventDefault()
                           event.currentTarget.classList.remove("dragover")
                           setConversationState(0.0)
                           setFiles([...event.dataTransfer.files])
                       }}>
                    <input type="file"
                           multiple={false}
                           onClick={(event) => {
                               // resets internal input state to force change event
                               event.currentTarget.value = ""
                           }}
                           onChange={(event) => {
                               setConversationState(0.0)
                               setFiles([...event.currentTarget.files ?? []])
                           }} />
                    Drop file here or click to browse
                </label>
            </fieldset>
            {(() => {
                if (typeof conversationState === "string") {
                    return <div className="error">{conversationState}</div>
                } else if (typeof conversationState === "number") {
                    return <Progress value={conversationState}></Progress>
                } else if (!ffmpegLoaded || files.length === 0) {
                    // Idle. Waiting for input...
                    return
                } else {
                    // we have a valid wav-file...
                    //
                    const objectURL = URL.createObjectURL(new Blob([conversationState.file_data], { type: "audio/wav" }))
                    const fileName = (() => {
                        const path = files[0].name
                        return path.substring(0, path.lastIndexOf("."))
                    })()
                    return (
                        <>
                            <div className="file-info">{
                                conversationState.meta_data.map((pair: KeyValuePair, index: int) =>
                                    <React.Fragment key={pair.key + index}>
                                        <span>{pair.key}</span>
                                        <span>{pair.value}</span>
                                    </React.Fragment>)}
                            </div>
                            <audio controls src={objectURL}></audio>
                            <div className="download">
                                <span>Download</span>
                                <a href={objectURL} download={`${fileName}.wav`}>{`${fileName}.wav`}</a>
                            </div>
                        </>
                    )
                }
            })()}
        </>
    )
}

export default App