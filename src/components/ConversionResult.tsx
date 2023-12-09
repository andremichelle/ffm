import "./ConversionResult.sass"
import React from "react"
import { int, KeyValuePair } from "../common/lang"
import { FileConversionResult } from "../ffmepg.ts"

type ConversationResultProps = {
    fileNameWithExtension: string
    state: PromiseSettledResult<FileConversionResult>
}

export const ConversionResult = ({ fileNameWithExtension, state }: ConversationResultProps) => {
    return (
        <div className="conversion-result">
            {(() => {
                if (state.status === "fulfilled") {
                    const objectURL = URL.createObjectURL(new Blob([state.value.file_data], { type: "audio/wav" }))
                    const fileName = fileNameWithExtension.substring(0, fileNameWithExtension.lastIndexOf("."))
                    return (
                        <details>
                            <summary>
                                <div className="name">{fileNameWithExtension}</div>
                                <audio controls src={objectURL}></audio>
                                <a href={objectURL} download={`${fileName}.wav`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
                                        <path
                                            d="M13 12H16L12 16L8 12H11V8H13V12ZM15 4H5V20H19V8H15V4ZM3 2.9918C3 2.44405 3.44749 2 3.9985 2H16L20.9997 7L21 20.9925C21 21.5489 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5447 3 21.0082V2.9918Z" />
                                    </svg>
                                </a>
                            </summary>
                            <div className="file-info">{
                                state.value.meta_data.map((pair: KeyValuePair, index: int) =>
                                    <React.Fragment key={pair.key + index}>
                                        <span>{pair.key}</span>
                                        <span>{pair.value}</span>
                                    </React.Fragment>)}
                            </div>
                        </details>)
                } else {
                    return (
                        <div className="failure">
                            <span className="name">{fileNameWithExtension}</span>
                            <span className="reason">Could not find audio data</span>
                        </div>)
                }
            })()}
        </div>
    )
}