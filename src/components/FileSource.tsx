import "./FileSource.sass"
import React from "react"

type FileSourceProps = {
    disabled: boolean
    onChanged: (files: ReadonlyArray<File>) => void
}

export const FileSource = ({ disabled, onChanged }: FileSourceProps) => (
    <fieldset className="file-source" disabled={disabled}>
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