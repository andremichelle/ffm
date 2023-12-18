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
            .catch(reason => {
                console.debug("caught cache", event.request.url, reason)
            })
            .then(response => {
                if (response === undefined) {
                    console.debug("missed cache", event.request.url)
                    return fetch(event.request).catch(() => new Response("Cache was not working.", { status: 200 }))
                } else {
                    console.debug("hit cache", event.request.url)
                    return response
                }
            })
    )
}

self.addEventListener("fetch", fetchListener as any)