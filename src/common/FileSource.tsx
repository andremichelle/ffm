import React from "react"

type FileSourceProps = {
    disabled: boolean
    onChanged: (files: ReadonlyArray<File>) => void
}

export const FileSource = ({disabled, onChanged}: FileSourceProps) => (
    <fieldset disabled={disabled}>
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
                   onChanged([...event.dataTransfer.files])
               }}>
            <input type="file"
                   multiple={false}
                   onClick={(event) => {
                       // resets internal input state to force change event
                       event.currentTarget.value = ""
                   }}
                   onChange={(event) => onChanged([...event.currentTarget.files ?? []])} />
            Drop file here or click to browse
        </label>
    </fieldset>
)