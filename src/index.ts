import {createCache as createAsynCacheDedupe} from "async-cache-dedupe"
import {search} from "@orama/orama"
import {validateOptions} from "./lib/validation"

import type {CreateCacheOptions} from "async-cache-dedupe"
import type {Orama, Results, SearchParams} from "@orama/orama"

export async function createOramaCache(db: Orama, cacheOptions: CreateCacheOptions = {ttl: 60, storage: {type: "memory"}}) {
  async function searchLyra(params: SearchParams): Promise<Results> {
    return search(db, params)
  }

  const options = validateOptions(cacheOptions)
  const cache = createAsynCacheDedupe(options)

  cache.define("search", {}, searchLyra)

  return cache
}
