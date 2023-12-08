import React, { ChangeEvent, useEffect, useState } from "react"
import "./App.sass"
import { FFmpegWorker, FileConversionResult } from "./common/ffmepg.ts"
import { int, KeyValuePair, Nullable } from "./common/lang.ts"

const App = () => {
    const [files, setFiles] = useState<ReadonlyArray<File>>([])
    const [ffmpegLoadingProgress, setFfmpegLoadingProgress] = useState(0.0)
    const [ffmpeg, setFfmpeg] = useState<Nullable<FFmpegWorker>>(null)
    const [conversationResult, setConversationResult] = useState<FileConversionResult | string>("N/A")

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => setFiles([...event.target.files ?? []])

    useEffect(() => {
        console.log("load")
        ;(async () => setFfmpeg(await FFmpegWorker.preload(progress => setFfmpegLoadingProgress(progress))))()
    }, [])

    useEffect(() => {
        if (ffmpeg !== null && files.length > 0) {
            (async () => {
                let result: FileConversionResult
                try {
                    result = await ffmpeg.convert(files[0])
                } catch (reason) {
                    setConversationResult("Unrecognised audio format")
                    return
                }
                setConversationResult(result)
            })()
        }
        return () => {
            // ffmpeg?.ffmpeg.terminate()
        }
    }, [files, ffmpeg])

    return (
        <>
            {ffmpeg === null ? <progress value={ffmpegLoadingProgress} max={1.0} /> : null}
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
                if (typeof conversationResult === "string") {
                    return <div>Issue: {conversationResult}</div>
                }
                const objectURL = URL.createObjectURL(new Blob([conversationResult.file_data], { type: "audio/wav" }))
                const fileName = (() => {
                    const path = files[0].name
                    return path.substring(0, path.lastIndexOf("."))
                })()
                return (
                    <div>
                        <div className="file-info">{
                            conversationResult.meta_data.map((pair: KeyValuePair, index: int) =>
                                <React.Fragment key={pair.key + index}>
                                    <span>{pair.key}</span>
                                    <span>{pair.value}</span>
                                </React.Fragment>)}
                        </div>
                        <audio controls src={objectURL}></audio>
                        <br />
                        <a href={objectURL} download={`${fileName}.wav`}>{`Download ${fileName}`}</a>
                    </div>
                )
            })()}
        </>
    )
}

export default App