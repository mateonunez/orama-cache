import {createCache as createAsynCacheDedupe, Options as CacheOptions} from "async-cache-dedupe"
import {search} from "@lyrasearch/lyra"
import type {Lyra, PropertiesSchema} from "@lyrasearch/lyra/dist/types"
import type {SearchResult} from "@lyrasearch/lyra/dist/methods/search"

type SearchCacheOptions<S extends PropertiesSchema> = {db: Lyra<S>; term: string}
type LyraCache = ReturnType<typeof createAsynCacheDedupe>

export async function createLyraCache(cacheOptions?: CacheOptions) {
  /* c8 ignore next 4 */
  const options = {
    ttl: cacheOptions?.ttl || 1000 * 60 * 60 * 24,
    storage: cacheOptions?.storage || {type: "memory"},
    ...cacheOptions
  }

  const cache = createAsynCacheDedupe(options) as Cache & LyraCache

  cache.define("search", {}, async <S extends PropertiesSchema>({db, term}: SearchCacheOptions<S>) => {
    return await search(db, {term})
  })

  return cache
}

export async function searchCache<S extends PropertiesSchema>(options: SearchCacheOptions<S>, cache: LyraCache): Promise<SearchResult<S>> {
  if (!cache) throw new Error("cache is required")
  if (!options.db) throw new Error("db is required")
  if (!options.term) throw new Error("term is required")

  return cache.search(options) as Promise<SearchResult<S>>
}
