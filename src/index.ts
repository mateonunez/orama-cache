/* eslint-disable @typescript-eslint/no-explicit-any */
import {createCache} from "async-cache-dedupe"
import {create, insert, search} from "@lyrasearch/lyra"
import {formatNanoseconds, getNanosecondsTime} from "@lyrasearch/lyra/dist/cjs/src/utils"

const cache = createCache({
  ttl: 5,
  storage: {type: "memory"}
})

const db = create({
  schema: {
    author: "string",
    quote: "string"
  }
})

cache.define("insert", {}, async (document: any) => {
  return new Promise(resolve => {
    const docID = insert(db, document)
    resolve({key: docID})
  })
})

cache.define("search", {}, async (term: string) => {
  return new Promise(resolve => resolve(search(db, {term})))
})

async function main() {
  for await (const _ of Array(100000).keys()) {
    await cache.insert({
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
}

main()
