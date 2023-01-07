import {createCache as createAsynCacheDedupe, Options as CacheOptions} from "async-cache-dedupe"
import {Lyra, PropertiesSchema, SearchResult, search} from "@lyrasearch/lyra"

type SearchCacheOptions<S extends PropertiesSchema> = {db: Lyra<S>; term: string}
type LyraCache = ReturnType<typeof createAsynCacheDedupe>

export function createLyraCache(cacheOptions?: CacheOptions) {
  /* c8 ignore next 4 */
  const options = {
    ttl: cacheOptions?.ttl || 1000 * 60 * 60 * 24,
    storage: cacheOptions?.storage || {type: "memory"},
    ...cacheOptions
  }

  const cache = createAsynCacheDedupe(options)
  cache.define("search", {}, async <S extends PropertiesSchema>({db, term}: SearchCacheOptions<S>) => {
    return search(db, {term})
  })

  return cache
}

export function searchCache<S extends PropertiesSchema>(options: SearchCacheOptions<S>, cache: LyraCache): Promise<SearchResult<S>> {
  if (!cache) throw new Error("cache is required")
  if (!options.db) throw new Error("db is required")
  if (!options.term) throw new Error("term is required")

  return cache.search(options) as Promise<SearchResult<S>>
}
