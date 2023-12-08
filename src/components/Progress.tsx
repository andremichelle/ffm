import "./Progress.sass"
import { unitValue } from "../common/lang"
import React from "react"

export const Progress = ({ value, className }: { value: unitValue, className?: string }) => {
    return (
        <div className={`progress ${className ?? ""}`}>
            <div style={{ "--value": Math.min(1.0, Math.max(0.0, value)) } as React.CSSProperties}></div>
        </div>
    )
}