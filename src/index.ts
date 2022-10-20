/* eslint-disable @typescript-eslint/no-explicit-any */
import {createCache} from "async-cache-dedupe"
import {create, insert, search, insertWithHooks} from "@lyrasearch/lyra"
import {formatNanoseconds, getNanosecondsTime} from "@lyrasearch/lyra/dist/cjs/src/utils"
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

const cache = createCache({
  ttl: 3,
  storage: {type: "memory"}
})

const db = create({
  schema: {
    author: "string",
    quote: "string"
  }
})


cache.define("search", {}, async (term: string) => {
  return search(db, {term})
})

async function main() {
  for (const _ of Array(100000).keys()) {
    insert(db, {
      author: "John Doe",
      quote: `Hello World! ${_}`
    })
  }

  const startTime = getNanosecondsTime()
  const fetchRes = await cache.search("Hello")
  console.log({
    elapsedTime: formatNanoseconds(getNanosecondsTime() - startTime),
    fetchRes
  })

  const startTimeCached = getNanosecondsTime()
  const fetchCached = await cache.search("Hello")
  console.log({
    elapsedTimeCached: formatNanoseconds(getNanosecondsTime() - startTimeCached),
    fetchCached
  })

  const startTimeWithoutCache = getNanosecondsTime()
  const fetchWithoutCache = search(db, {term: "Hello"})
  console.log({
    elapsedTimeWithoutCache: formatNanoseconds(getNanosecondsTime() - startTimeWithoutCache),
    fetchWithoutCache
  })

  await sleep(4000)

  const startTimeCachedAfterTTL = getNanosecondsTime()
  const fetchCachedAfterTTL = await cache.search("Hello")
  console.log({
    elapsedTimeCachedAfterTTL: formatNanoseconds(getNanosecondsTime() - startTimeCachedAfterTTL),
    fetchCachedAfterTTL
  })

  const startTimeCachedAfterTTL2 = getNanosecondsTime()
  const fetchCachedAfterTTL2 = await cache.search("Hello")
  console.log({
    elapsedTimeCachedAfterTTL2: formatNanoseconds(getNanosecondsTime() - startTimeCachedAfterTTL2),
    fetchCachedAfterTTL2
  })
}

main()
