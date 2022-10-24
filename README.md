# Lyra cache

Cache your [Lyra](https://github.com/lyrasearch/lyra) searches using [async-cache-dedupe](https://github.com/mcollina/async-cache-dedupe).

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
import { searchCache } from "@mateonunez/lyra-cache"

(async() => {
  const db = create({ schema: { name: "string" } })

  insert(db, { name: "foo" })
  insert(db, { name: "bar" })

  const results = await searchCache({ db, term: "foo" }) // native Lyra search

  // The next same search will be cached

  const resultsCached = await searchCache({ db, term: "foo" }) // performed x2000 times faster via cache
})()
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
