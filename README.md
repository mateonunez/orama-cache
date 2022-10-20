# Lyra cache

Cache your [Lyra](https://github.com/lyrasearch/lyra) searches using [async-cache-dedupe](https://github.com/mcollina/async-cache-dedupe).

[![Tests](https://github.com/mateonunez/lyra-cache/actions/workflows/ci.yml/badge.svg?branch=main)](https://github.com/mateonunez/lyra-cache/actions/workflows/ci.yml)

## Result

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
