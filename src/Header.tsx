import { Progress } from "./Progress.tsx"
import { unitValue } from "./common/lang.ts"

export const Header = ({ progress }: { progress: unitValue }) => (
    <header>
        <div>
            <div>ffmpeg</div>
            <img src="ffmpeg.wasm.png" alt="logo" />
            <Progress className={progress === 1.0 ? "" : "blink"} value={progress} />
        </div>
    </header>)