import "./ConversionResult.sass"
import React from "react"
import { int, KeyValuePair } from "../common/lang"
import { FileConversionResult } from "../common/ffmepg"

type ConversationResultProps = {
    name: string
    state: FileConversionResult
}

export const ConversionResult = ({ name, state }: ConversationResultProps) => {
    const objectURL = URL.createObjectURL(new Blob([state.file_data], { type: "audio/wav" }))
    return (
        <>
            <div className="file-info">{
                state.meta_data.map((pair: KeyValuePair, index: int) =>
                    <React.Fragment key={pair.key + index}>
                        <span>{pair.key}</span>
                        <span>{pair.value}</span>
                    </React.Fragment>)}
            </div>
            <audio controls src={objectURL}></audio>
            <div className="download">
                <span>Download</span>
                <a href={objectURL} download={`${name}.wav`}>{`${name}.wav`}</a>
            </div>
        </>
    )
}