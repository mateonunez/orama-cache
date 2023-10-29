import {createCache as createAsynCacheDedupe} from "async-cache-dedupe"
import {search} from "@orama/orama"
import {validateOptions} from "./lib/validation.js"

import type {CreateCacheOptions} from "async-cache-dedupe"
import type {Orama, Results, SearchParams} from "@orama/orama"

function createOramaCache<T>(db: Orama<T>, cacheOptions: CreateCacheOptions = {ttl: 60, storage: {type: "memory"}}) {
  async function searchOrama(params: SearchParams<Orama<T>, T>): Promise<Results<T>> {
    return search(db, params)
  }

  const options = validateOptions(cacheOptions)
  const cache = createAsynCacheDedupe(options)

  cache.define("search", {}, searchOrama)

  return cache
}

export {createOramaCache}
export default createOramaCache
