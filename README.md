# Lyra cache

Implement the cache dedupe on your [Lyra](https://github.com/lyrasearch/lyra) instances.

[![Tests](https://github.com/mateonunez/lyra-cache/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/mateonunez/lyra-cache/actions/workflows/ci.yml)


## Installation

You can install Lyra using `npm`, `yarn`, `pnpm`:

```sh
npm i @mateonunez/lyra-cache
```
```sh
yarn add @mateonunez/lyra-cache
```
```sh
pnpm add @mateonunez/lyra-cache
```

## Usage

```js
import { create, insert } from "@lyrasearch/lyra"
import { createLyraCache, searchCache } from "@mateonunez/lyra-cache"

(async() => {
  const db = create({ schema: { name: "string" } })

  await insert(db, { name: "foo" })
  await insert(db, { name: "bar" })

  const lyraCache = await createLyraCache() // create a cache instance

  const results = await searchCache({ db, term: "foo" }, lyraCache)

  // ...

  const resultsCached = await searchCache({ db, term: "foo" }, lyraCache) // performed faster via cache
})()
```

## The Lyra Cache object

The Lyra Cache object is a [async-cache-dedupe](https://github.com/mcollina/async-cache-dedupe) wrapper. It means that you can use all the methods that the original package provides. Same for the options.

> Example using Redis as storage
```js
const lyraCache = createLyraCache({
  storage: {
    type: 'redis',
    options: {
      client: new Redis(),
      invalidation: {
        referencesTTL: 60 // seconds
      }
    }
  }
})
```

## Example

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

# License

[MIT](/LICENSE)
