import "./ConversionResult.sass"
import React from "react"
import { int, KeyValuePair } from "../common/lang"
import { FileConversionResult } from "../common/ffmepg"

type ConversationResultProps = {
    fileNameWithExtension: string
    state: PromiseSettledResult<FileConversionResult>
}

export const ConversionResult = ({ fileNameWithExtension, state }: ConversationResultProps) => {
    return (
        <div className="conversion-result">
            <div className="name">{fileNameWithExtension}</div>
            {(() => {
                if (state.status === "fulfilled") {
                    const objectURL = URL.createObjectURL(new Blob([state.value.file_data], { type: "audio/wav" }))
                    const fileName = fileNameWithExtension.substring(0, fileNameWithExtension.lastIndexOf("."))
                    return <>
                        <div className="file-info">{
                            state.value.meta_data.map((pair: KeyValuePair, index: int) =>
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
                } else {
                    return <div className="error">Could not find audio data</div>
                }
            })()}
        </div>
    )
}