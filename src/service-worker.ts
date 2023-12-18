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
    const url: string = event.request.url
    console.debug("fetch", url)
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response !== undefined) {
                    console.debug("hit cache", url)
                    return response
                }
                if (event.request.url.endsWith("/favicon.ico")) {
                    console.debug("favicon")
                    return caches.match("/ffm/favicon.ico")
                        .then((faviconResponse) => {
                            if (faviconResponse) {
                                console.debug("favicon found")
                                return faviconResponse
                            } else {
                                console.debug("favicon found")
                                return new Response("Favicon not found in cache.", { status: 404 })
                            }
                        })
                }
                console.debug("missed cache", url)
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
