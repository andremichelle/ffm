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
    const newUrl = new URL(event.request.url)
    newUrl.pathname = `/ffm${newUrl.pathname}`

    const isSubdirectoryResource = event.request.url.startsWith(self.location.origin + "/ffm/")

    console.debug("fetch", newUrl.toString(), `isSubdirectoryResource: ${isSubdirectoryResource}`)

    event.respondWith(
        caches.match(isSubdirectoryResource ? new Request(newUrl) : event.request)
            .then(response => {
                if (response) {
                    console.debug("hit cache", newUrl.toString())
                    return response
                }
                console.debug("missed cache", newUrl.toString())
                return fetch(isSubdirectoryResource ? new Request(newUrl) : event.request)
                    .catch(() => new Response("Offline: Cache was not working.", { status: 200 }))
            })
            .catch(error => {
                console.error("Error in fetch handler:", error)
                return new Response("Error handling fetch request.", { status: 500 })
            })
    )
}

self.addEventListener("fetch", fetchListener as any)