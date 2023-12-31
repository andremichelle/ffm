import "./ConversionResult.sass"
import React, { useEffect, useRef, useState } from "react"
import { asDefined, int, KeyValuePair } from "../common/lang"
import { FileConversionResult } from "../ffmepg.ts"

type ConversationResultProps = {
    fileNameWithExtension: string
    state: PromiseSettledResult<FileConversionResult>
}

export const ConversionResult = ({ fileNameWithExtension, state }: ConversationResultProps) => {
    const nameRef = useRef<HTMLDivElement>(null)
    const infoRef = useRef<HTMLDivElement>(null)
    // For Firefox it is important to use undefined and not an empty string.
    // An empty string renders the audio object invalid and does not allow new src values, even if valid.
    const [objectURL, setObjectURL] = useState<string | undefined>(undefined)
    useEffect(() => {
        if (state.status === "fulfilled") {
            setObjectURL(URL.createObjectURL(state.value.file_data))
        }
        return () => {
            if (objectURL !== undefined) {
                URL.revokeObjectURL(objectURL)
            }
            setObjectURL(undefined)
        }
    }, [])
    return (
        <div className="conversion-result">
            {(() => {
                if (state.status === "fulfilled") {
                    const fileName = fileNameWithExtension.substring(0, fileNameWithExtension.lastIndexOf("."))
                    return (
                        <>
                            <div className="file-header">
                                <div className="name"
                                     ref={nameRef}
                                     onClick={() => asDefined(infoRef.current).classList.toggle("hidden")}>
                                    {fileNameWithExtension}
                                </div>
                                <audio controls src={objectURL} preload="auto"
                                       onPlay={() => nameRef.current?.classList.add("playing")}
                                       onPause={() => nameRef.current?.classList.remove("playing")}
                                       onError={event => console.warn("onError", event)}
                                ></audio>
                                <a href={objectURL} download={`${fileName}.wav`}
                                   onClick={event => event.stopPropagation()}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                                         strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                                        <path stroke-cap="round" stroke-join="round"
                                              d="M9 8.25H7.5a2.25 2.25 0 00-2.25 2.25v9a2.25 2.25 0 002.25 2.25h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25H15M9 12l3 3m0 0l3-3m-3 3V2.25" />
                                    </svg>
                                </a>
                            </div>
                            <div className="file-info hidden" ref={infoRef}>
                                {state.value.meta_data.map((pair: KeyValuePair, index: int) =>
                                    <React.Fragment key={pair.key + index}>
                                        <span>{pair.key}</span>
                                        <span>{pair.value}</span>
                                    </React.Fragment>
                                )}
                            </div>
                        </>)
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