import "./Progress.sass"
import { unitValue } from "../common/lang"
import React from "react"

export const Progress = ({ value, className }: { value: unitValue, className?: string }) => {
    return (
        <div className={`progress ${className ?? ""}`}>
            <div style={{ "--value": value } as React.CSSProperties}></div>
        </div>
    )
}