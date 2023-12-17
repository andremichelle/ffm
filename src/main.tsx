import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import ServiceWorkerUrl from "./service-worker.ts?worker&url"
import "./index.sass"

ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
)

// TODO This is not working.
//  Try moving the service-worker script into the root of the /dist folder and remove the scope
if (false && import.meta.env.PROD && "serviceWorker" in navigator) {
    console.debug("register ServiceWorker...")
    navigator.serviceWorker.register(ServiceWorkerUrl, { type: "module", scope: "/ffm/" })
        .then((registration: ServiceWorkerRegistration) =>
                console.debug("ServiceWorker registration successful with scope: ", registration.scope),
            err => console.warn("ServiceWorker registration failed: ", err))
}