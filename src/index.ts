import {createCache as createAsynCacheDedupe} from "async-cache-dedupe"
import {search} from "@lyrasearch/lyra"
import type {CreateCacheOptions} from "async-cache-dedupe"
import type {Lyra, PropertiesSchema} from "@lyrasearch/lyra/dist/types"
import type {SearchResult, SearchParams} from "@lyrasearch/lyra/dist/methods/search"

export async function createLyraCache<T extends PropertiesSchema>(db: Lyra<T>, cacheOptions?: CreateCacheOptions) {
  async function searchLyra(params: SearchParams<T>): Promise<SearchResult<T>> {
    return search(db, params)
  }

  /* c8 ignore next 4 */
  const options = {
    ttl: cacheOptions?.ttl || 60,
    storage: cacheOptions?.storage || {type: "memory"},
    ...cacheOptions
  }

  const cache = createAsynCacheDedupe(options)
  cache.define("search", {}, searchLyra)
  return cache
}
