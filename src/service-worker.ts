const CACHE_NAME = "ffm-cache-v1"

console.log("sw", CACHE_NAME)

const installListener = (event: ExtendableEvent) => {
    console.debug("sw received install event.")
    event.waitUntil(
        caches
            .open(CACHE_NAME)
            .then(async (cache: Cache) => cache
                .addAll(await fetch("./cache.json")
                    .then(x => x.json()) as Array<string>))
            .then(() => console.debug("caching completed."))
            .catch(reason => console.warn("caching failed", reason))
    )
}

self.addEventListener("install", installListener as any)

const fetchListener = (event: FetchEvent) => {
    console.debug("fetch", event.request.url)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) {
                    console.debug("hit cache", event.request.url)
                    return response
                }
                console.debug("missed cache", event.request.url)
                return fetch(event.request).catch(() => {
                    console.debug("Network request failed, offline mode")
                    return new Response("Offline: Cache was not working.", { status: 200 })
                })
            })
            .catch(error => {
                console.error("Error in fetch handler:", error)
                return new Response("Error handling fetch request.", { status: 500 })
            })
    )
}

self.addEventListener("fetch", fetchListener as any)
