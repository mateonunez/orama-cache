# ✨💨 Orama Cache

This plugin provides a cache system for [Orama](https://github.com/oramasearch/orama). The cache system is based on [async-cache-dedupe](https://github.com/mcollina/async-cache-dedupe).

[![Tests](https://github.com/mateonunez/orama-cache/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/mateonunez/orama-cache/actions/workflows/ci.yml)

## 🚀 Getting Started

### 📦 Installation

```bash
# You can install Orama using `npm`, `yarn`, `pnpm`:
npm install orama-cache
```

### 📝 Usage

> Example using the default storage (memory)

```js
import { create, insert } from "@orama/orama"
import { createOramaCache } from "orama-cache"

(async() => {
  const db = create({ schema: { name: "string" } })

  await insert(db, { name: "foo" })
  await insert(db, { name: "bar" })

  const cache = await createOramaCache(db) // Create the cache.

  const results = await cache.search({ term: "foo" }) // This method will return the results and cache them.

  // ...

  const cachedResults = await cache.search({ term: "foo" }) // Returns the cached results.
})()

```

## 📖 Documentation

You can use the same APIs as [async-cache-dedupe](https://github.com/mcollina/async-cache-dedupe#api).

> Example using Redis as storage
```js
const oramaCache = createOramaCache({
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

### ✅ Results

The `orama-cache` plugin provides a set of benchmarks to compare the performance of the cache system with the default search.

```bash
npm run benchmark
```

```bash
# Results

╔══════════════════════╤═════════╤══════════════════╤═══════════╤═════════════════════════╗
║ Slower tests         │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟──────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Orama search         │   30000 │ 184233.47 op/sec │  ± 1.53 % │                         ║
╟──────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Fastest test         │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟──────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Orama caching search │   30000 │ 596449.98 op/sec │  ± 1.91 % │ + 223.75 %              ║
╚══════════════════════╧═════════╧══════════════════╧═══════════╧═════════════════════════╝

╔══════════════════════════════════════╤═════════╤══════════════════╤═══════════╤═════════════════════════╗
║ Slower tests                         │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Orama search with properties         │   30000 │ 208403.59 op/sec │  ± 1.40 % │                         ║
╟──────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Fastest test                         │ Samples │           Result │ Tolerance │ Difference with slowest ║
╟──────────────────────────────────────┼─────────┼──────────────────┼───────────┼─────────────────────────╢
║ Orama caching search with properties │   30000 │ 524996.42 op/sec │  ± 2.40 % │ + 151.91 %              ║
╚══════════════════════════════════════╧═════════╧══════════════════╧═══════════╧═════════════════════════╝
```

## ⚠️ Testing

To run the tests you should run the following commands:

```bash
npm run redis
```

That command shall start a new Redis istance using Docker. Then run the tests.

```bash
npm run tests
```

## 📝 License

[MIT](/LICENSE)
