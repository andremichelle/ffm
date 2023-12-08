import React, { useEffect, useState } from "react"
import { FFmpegWorker, FileConversionResult } from "./common/ffmepg.ts"
import { int, KeyValuePair, unitValue } from "./common/lang.ts"
import "./App.sass"
import { Progress } from "./Progress.tsx"

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
                    <div>ffmpeg</div>
                    <img src="ffmpeg.wasm.png" alt="logo" />
                    <Progress className={ffmpegLoaded ? "" : "blink"} value={ffmpegLoaded ? 1.0 : ffmpeg} />
                </div>
            </header>
            <h1>Quickly Convert Any Audio File To Wav</h1>
            <fieldset disabled={!ffmpegLoaded || typeof conversationState === "number"}>
                <label className="file"
                       onDragOver={event => event.preventDefault()}
                       onDrop={event => {
                           event.preventDefault()
                           setConversationState(0.0)
                           setFiles([...event.dataTransfer.files])
                       }}>
                    <input type="file"
                           multiple={false}
                           onChange={(event) => {
                               setConversationState(0.0)
                               setFiles([...event.target.files ?? []])
                           }} />
                    Drop file here or click to browse
                </label>
            </fieldset>
            {(() => {
                if (!ffmpegLoaded || files.length === 0) {
                    return
                } else if (typeof conversationState === "string") {
                    return <div className="error">{conversationState}</div>
                } else if (typeof conversationState === "number") {
                    return <Progress value={conversationState}></Progress>
                } else {
                    // we have a valid wav-file...
                    //
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
                }
            })()}
        </>
    )
}

export default App