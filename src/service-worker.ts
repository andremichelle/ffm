const CACHE_NAME = "ffm-cache-v1"

console.log("sw", CACHE_NAME)

const installListener = (event: ExtendableEvent) => {
    console.debug("sw received install event.")
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async (cache: Cache) => cache.addAll(await fetch("assets/asset-manifest.json").then(x => x.json()) as Array<string>))
            .then(() => console.debug("caching completed."))
    )
}

self.addEventListener("install", installListener as any)

const fetchListener = (event: FetchEvent) => {
    event.respondWith(
        fetch(event.request)
            .then(response => {
                const cacheCopy = response.clone()
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, cacheCopy))
                return response
            })
            .catch(() =>
                caches.match(event.request).then(cachedResponse => cachedResponse || new Response("Fallback content", { status: 200 })))
    )
}

self.addEventListener("fetch", fetchListener as any)