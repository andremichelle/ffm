const CACHE_NAME = "ffm-cache-v1"

console.debug("sw", CACHE_NAME)

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
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response === undefined) {
                    return fetch(event.request).catch(() => new Response("Offline. Cache missed.", { status: 404 }))
                } else {
                    return response
                }
            })
            .catch(error => new Response(`Error handling fetch request: ${error}`, { status: 500 }))
    )
}

self.addEventListener("fetch", fetchListener as any)