import {createCache as createAsynCacheDedupe} from "async-cache-dedupe"
import {search} from "@lyrasearch/lyra"
import {validateOptions} from "./lib/validation"

import type {CreateCacheOptions} from "async-cache-dedupe"
import type {Lyra, PropertiesSchema} from "@lyrasearch/lyra/dist/types"
import type {SearchResult, SearchParams} from "@lyrasearch/lyra/dist/methods/search"

export async function createLyraCache<T extends PropertiesSchema>(db: Lyra<T>, cacheOptions: CreateCacheOptions = {ttl: 60, storage: {type: "memory"}}) {
  async function searchLyra(params: SearchParams<T>): Promise<SearchResult<T>> {
    return search(db, params)
  }

  const options = validateOptions(cacheOptions)
  const cache = createAsynCacheDedupe(options)

  cache.define("search", {}, searchLyra)

  return cache
}
