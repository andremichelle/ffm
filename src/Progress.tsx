import { unitValue } from "./common/lang.ts"
import "./Progress..sass"
import React from "react"

export const Progress = ({ value }: { value: unitValue }) => {
    return (
        <div className="progress">
            <div style={{ "--value": value } as React.CSSProperties}></div>
        </div>
    )
}