# ✨💨 Lyra Cache

This plugin provides a cache system for [Lyra](https://github.com/lyrasearch/lyra). The cache system is based on [async-cache-dedupe](https://github.com/mcollina/async-cache-dedupe).

[![Tests](https://github.com/mateonunez/lyra-cache/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/mateonunez/lyra-cache/actions/workflows/ci.yml)

## 🚀 Getting Started

### 📦 Installation

```bash
# You can install Lyra using `npm`, `yarn`, `pnpm`:
npm install lyra-cache
```

### 📝 Usage

> Example using the default storage (memory)

```js
import { create, insert } from "@lyrasearch/lyra"
import { createLyraCache } from "lyra-cache"

(async() => {
  const db = create({ schema: { name: "string" } })

  await insert(db, { name: "foo" })
  await insert(db, { name: "bar" })

  const cache = await createLyraCache(db) // Create the cache.

  const results = await cache.search({ term: "foo" }) // This method will return the results and cache them.

  // ...

  const cachedResults = await cache.search({ term: "foo" }) // Returns the cached results.
})()

```

## 📖 Documentation

You can use the same APIs as [async-cache-dedupe](https://github.com/mcollina/async-cache-dedupe#api).

> Example using Redis as storage
```js
const lyraCache = createLyraCache({
  storage: {
    type: 'redis',
    options: {
      client: new Redis(),
      invalidation: {
        invalidates: true,
        referencesTTL: 60 // seconds
      }
    }
  }
})
```

## 📈 Benchmarks

Some searches can be ~2K faster using a cache system.

```js
{
  elapsedTime: '81ms',
  fetchRes: {
    elapsed: 81312667n,
    hits: [
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object]
    ],
    count: 100000
  }
}
// Cached result, same searched `term`
{
  elapsedTimeCached: '40μs',
  fetchCached: {
    elapsed: 81312667n,
    hits: [
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object],
      [Object], [Object]
    ],
    count: 100000
  }
}
```

## 📝 License

[MIT](/LICENSE)
