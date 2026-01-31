/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-2ae722a1'], (function (workbox) { 'use strict';

  self.skipWaiting();
  workbox.clientsClaim();

  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */
  workbox.precacheAndRoute([{
    "url": "registerSW.js",
    "revision": "1872c500de691dce40960bb85481de07"
  }, {
    "url": "pwa-64x64.svg",
    "revision": "bc2501f8f41f40eedcb6373c11f35e24"
  }, {
    "url": "pwa-512x512.svg",
    "revision": "ed2db2c3722c7047c871da90a50b263e"
  }, {
    "url": "pwa-192x192.svg",
    "revision": "5d0155071611b5b3e6701d364a3f3469"
  }, {
    "url": "index.html",
    "revision": "8aaeb8aaf57917d1156fd3e63e1e71aa"
  }, {
    "url": "icon.svg",
    "revision": "e7c533b0b027837e540f40360fa38cd2"
  }, {
    "url": "favicon.svg",
    "revision": "acb9ed0929d5be4019cd310f2466acaf"
  }, {
    "url": "apple-touch-icon.svg",
    "revision": "744d68cedc05da8e67813f954b9634c8"
  }, {
    "url": "assets/index-D1H9mmV7.css",
    "revision": null
  }, {
    "url": "assets/index-CSF6MEHD.js",
    "revision": null
  }, {
    "url": "apple-touch-icon.svg",
    "revision": "744d68cedc05da8e67813f954b9634c8"
  }, {
    "url": "favicon.svg",
    "revision": "acb9ed0929d5be4019cd310f2466acaf"
  }, {
    "url": "icon.svg",
    "revision": "e7c533b0b027837e540f40360fa38cd2"
  }, {
    "url": "pwa-192x192.svg",
    "revision": "5d0155071611b5b3e6701d364a3f3469"
  }, {
    "url": "pwa-512x512.svg",
    "revision": "ed2db2c3722c7047c871da90a50b263e"
  }, {
    "url": "pwa-64x64.svg",
    "revision": "bc2501f8f41f40eedcb6373c11f35e24"
  }, {
    "url": "manifest.webmanifest",
    "revision": "11980ffb19c23f9b616e37d048f32d7a"
  }], {});
  workbox.cleanupOutdatedCaches();
  workbox.registerRoute(new workbox.NavigationRoute(workbox.createHandlerBoundToURL("index.html")));
  workbox.registerRoute(/^https:\/\/fonts\.googleapis\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "google-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');
  workbox.registerRoute(/^https:\/\/fonts\.gstatic\.com\/.*/i, new workbox.CacheFirst({
    "cacheName": "gstatic-fonts-cache",
    plugins: [new workbox.ExpirationPlugin({
      maxEntries: 10,
      maxAgeSeconds: 31536000
    })]
  }), 'GET');

}));
