import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.sass"

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

console.debug(`PROD: ${import.meta.env.PROD}`)

if (import.meta.env.PROD && "serviceWorker" in navigator) {
    console.debug("register ServiceWorker...")
    navigator.serviceWorker.register("./service-worker.js", { type: "module" })
        .then((registration: ServiceWorkerRegistration) =>
                console.debug("ServiceWorker registration successful with scope: ", registration.scope),
            err => console.warn("ServiceWorker registration failed: ", err))
}

self.addEventListener("beforeinstallprompt", (event: Event) => {
    console.debug(event)
})