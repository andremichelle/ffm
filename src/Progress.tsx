import { unitValue } from "./common/lang.ts"
import "./Progress..sass"
import React from "react"

export const Progress = ({ value, className }: { value: unitValue, className: string }) => {
    return (
        <div className={`progress ${className}`}>
            <div style={{ "--value": value } as React.CSSProperties}></div>
        </div>
    )
}