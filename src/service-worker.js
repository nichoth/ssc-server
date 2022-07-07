self.addEventListener("install", function (event) {
    console.log('...this service worker does nothing...', event)
    // event.waitUntil(self.skipWaiting())
})

self.addEventListener("activate", function (event) {
    console.log('**********************activation', event)
    // event.waitUntil(purgeExpiredRecords(caches));
})

self.addEventListener("fetch", function (event) {
    var request = event.request;
    // console.log("Detected request", request)

    // we cant intercept cloudinary requests because they are on a different
    // domain

    const shouldIgnore = ((request.method !== "GET" ||
        !request.url.match(/\.(jpe?g|png|gif|svg|ico)$/)) &&
        !request.url.includes('cloudinary')
    )

    // console.log('should ignore', shouldIgnore)

    // return fetch(request.clone())
    return fetch(request)
})



// /**
//  * Service worker interepts requests for images
//  * It puts retrieved images in cache for 10 minutes 
//  * If image not found responds with fallback
//  */

// var INVALIDATION_INTERVAL = 10 * 60 * 1000; // 10 min
// var NS = "IMAGE";
// var SEPARATOR = "|";
// var VERSION = Math.ceil( now() / INVALIDATION_INTERVAL  );

// /**
//  * Helper to get current timestamp
//  * @returns {Number}
//  */
// function now() {
//     var d = new Date();
//     return d.getTime();
// }

// /**
//  * Build cache storage key that includes namespace, url and record version
//  * @param {String} url
//  * @returns {String}
//  */
// function buildKey(url) {
//     return  NS + SEPARATOR + url + SEPARATOR + VERSION;
// }

// /**
//  * The complete Triforce, or one or more components of the Triforce.
//  * @typedef {Object} RecordKey
//  * @property {String} ns - namespace
//  * @property {String} url - request identifier
//  * @property {String} ver - record varsion
//  */

// /**
//  * Parse cache key
//  * @param {String} key
//  * @returns {RecordKey}
//  */
// function parseKey (key) {
//     var parts = key.split(SEPARATOR);
//     return {
//         ns: parts[0],
//         key: parts[1],
//         ver: parseInt(parts[2], 10)
//     };
// }

// /**
//  * Invalidate records matching actual version
//  *
//  * @param {Cache} caches
//  * @returns {Promise}
//  */
// function purgeExpiredRecords( caches ) {
//     console.log( "Purging..." );
//     return caches.keys().then(function (keys) {
//         return Promise.all(
//             keys.map(function( key ) {
//                 var record = parseKey(key);
//                 if (record.ns === NS && record.ver !== VERSION) {
//                     console.log("deleting", key);
//                     return caches.delete(key);
//                 }
//             })
//         );
//     });
// }

/**
 * Proxy request using cache-first strategy
 *
 * @param {Cache} caches
 * @param {Request} request
 * @returns {Promise}
 */
// function proxyRequest (caches, request) {
//     var key = buildKey(request.url);
//     // set namespace
//     return caches.open(key).then(function(cache) {
//         // check cache
//         return cache.match(request).then(function (cachedResponse) {
//             if (cachedResponse) {
//                 console.info("Take it from cache", request.url);
//                 return cachedResponse;
//             }

//             // { mode: "no-cors" } gives opaque response
//             // https://fetch.spec.whatwg.org/#concept-filtered-response-opaque
//             // so we cannot get info about response status
//             return fetch(request.clone())
//                 .then(function (networkResponse) {
//                     const isNotAvail = (networkResponse.type !== "opaque" &&
//                         networkResponse.ok === false)

//                     if (isNotAvail) {
//                         throw new Error( "Resource not available" );
//                     }

//                     console.info("Fetch it through Network", request.url,
//                         networkResponse.type);
//                     cache.put(request, networkResponse.clone());

//                     return networkResponse;
//                 }).catch(function() {
//                     console.error( "Failed to fetch", request.url );
//                     // Placeholder image for the fallback
//                     return fetch("./placeholder.jpg", { mode: "no-cors" });
//                 });
//         });
//     });
// }


// self.addEventListener("install", function (event) {
//     console.log('!!!!!!!install', event)
//     event.waitUntil(self.skipWaiting());
// });

// self.addEventListener("activate", function (event) {
//     console.log('activate', event)
//     event.waitUntil(purgeExpiredRecords(caches));
// });


// // self.addEventListener("fetch", function (event) {
// //     var request = event.request;

// //     console.log("Detected request", request);

// //     // we cant intercept cloudinary requests because they are on a different
// //     // domain

// //     const shouldIgnore = ((request.method !== "GET" ||
// //         !request.url.match(/\.(jpe?g|png|gif|svg|ico)$/)) &&
// //         !request.url.includes('cloudinary')
// //     )

// //     console.log('should ignore', shouldIgnore)

// //     if (shouldIgnore) return;

// //     console.log("**************Accepted* request", request.url);

// //     event.respondWith(proxyRequest(caches, request));
// // });
