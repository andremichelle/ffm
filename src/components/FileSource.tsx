import "./FileSource.sass"
import React from "react"

type FileSourceProps = {
    loaded: boolean
    disabled: boolean
    onChanged: (files: ReadonlyArray<File>) => void
}

export const FileSource = ({ loaded, disabled, onChanged }: FileSourceProps) => (
    <fieldset className={`file-source ${loaded ? "loaded" : ""}`} disabled={disabled}>
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <rect x="1" y="1" width="7.33" height="7.33">
                <animate id="spinner_oJFS" begin="0;spinner_5T1J.end+0.2s" attributeName="x" dur="0.6s"
                         values="1;4;1" />
                <animate begin="0;spinner_5T1J.end+0.2s" attributeName="y" dur="0.6s" values="1;4;1" />
                <animate begin="0;spinner_5T1J.end+0.2s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33" />
                <animate begin="0;spinner_5T1J.end+0.2s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33" />
            </rect>
            <rect x="8.33" y="1" width="7.33" height="7.33">
                <animate begin="spinner_oJFS.begin+0.1s" attributeName="x" dur="0.6s" values="8.33;11.33;8.33" />
                <animate begin="spinner_oJFS.begin+0.1s" attributeName="y" dur="0.6s" values="1;4;1" />
                <animate begin="spinner_oJFS.begin+0.1s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33" />
                <animate begin="spinner_oJFS.begin+0.1s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33" />
            </rect>
            <rect x="1" y="8.33" width="7.33" height="7.33">
                <animate begin="spinner_oJFS.begin+0.1s" attributeName="x" dur="0.6s" values="1;4;1" />
                <animate begin="spinner_oJFS.begin+0.1s" attributeName="y" dur="0.6s" values="8.33;11.33;8.33" />
                <animate begin="spinner_oJFS.begin+0.1s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33" />
                <animate begin="spinner_oJFS.begin+0.1s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33" />
            </rect>
            <rect x="15.66" y="1" width="7.33" height="7.33">
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="x" dur="0.6s" values="15.66;18.66;15.66" />
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="y" dur="0.6s" values="1;4;1" />
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33" />
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33" />
            </rect>
            <rect x="8.33" y="8.33" width="7.33" height="7.33">
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="x" dur="0.6s" values="8.33;11.33;8.33" />
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="y" dur="0.6s" values="8.33;11.33;8.33" />
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33" />
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33" />
            </rect>
            <rect x="1" y="15.66" width="7.33" height="7.33">
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="x" dur="0.6s" values="1;4;1" />
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="y" dur="0.6s" values="15.66;18.66;15.66" />
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33" />
                <animate begin="spinner_oJFS.begin+0.2s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33" />
            </rect>
            <rect x="15.66" y="8.33" width="7.33" height="7.33">
                <animate begin="spinner_oJFS.begin+0.3s" attributeName="x" dur="0.6s" values="15.66;18.66;15.66" />
                <animate begin="spinner_oJFS.begin+0.3s" attributeName="y" dur="0.6s" values="8.33;11.33;8.33" />
                <animate begin="spinner_oJFS.begin+0.3s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33" />
                <animate begin="spinner_oJFS.begin+0.3s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33" />
            </rect>
            <rect x="8.33" y="15.66" width="7.33" height="7.33">
                <animate begin="spinner_oJFS.begin+0.3s" attributeName="x" dur="0.6s" values="8.33;11.33;8.33" />
                <animate begin="spinner_oJFS.begin+0.3s" attributeName="y" dur="0.6s" values="15.66;18.66;15.66" />
                <animate begin="spinner_oJFS.begin+0.3s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33" />
                <animate begin="spinner_oJFS.begin+0.3s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33" />
            </rect>
            <rect x="15.66" y="15.66" width="7.33" height="7.33">
                <animate id="spinner_5T1J" begin="spinner_oJFS.begin+0.4s" attributeName="x" dur="0.6s"
                         values="15.66;18.66;15.66" />
                <animate begin="spinner_oJFS.begin+0.4s" attributeName="y" dur="0.6s" values="15.66;18.66;15.66" />
                <animate begin="spinner_oJFS.begin+0.4s" attributeName="width" dur="0.6s" values="7.33;1.33;7.33" />
                <animate begin="spinner_oJFS.begin+0.4s" attributeName="height" dur="0.6s" values="7.33;1.33;7.33" />
            </rect>
        </svg>
        <label
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
                onChanged([...event.dataTransfer.files])
            }}>
            <input type="file"
                   multiple={true}
                   onClick={(event) => {
                       // resets internal input state to force change event
                       event.currentTarget.value = ""
                   }}
                   onChange={(event) => onChanged([...event.currentTarget.files ?? []])} />
            Drop files here or click to browse...
        </label>
    </fieldset>
)