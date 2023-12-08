import "./Header.sass"
import { Progress } from "./Progress"
import { unitValue } from "../common/lang"

export const Header = ({ progress }: { progress: unitValue }) => (
    <header>
        <div>
            <div>ffmpeg</div>
            <img src="ffmpeg.wasm.png" alt="logo" />
            <Progress className={progress === 1.0 ? "" : "blink"} value={progress} />
            <div style={{fontSize: "0.5em"}}>{progress < 1.0 ? "LOADING" : "READY"}</div>
        </div>
    </header>)