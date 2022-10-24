import {createCache} from "async-cache-dedupe"
import {Lyra, PropertiesSchema, SearchResult, search} from "@lyrasearch/lyra"

type SearchCacheOptions<S extends PropertiesSchema> = {db: Lyra<S>; term: string}

const cache = createCache({
  ttl: 1000,
  storage: {type: "memory"}
})

cache.define("search", {}, async <S extends PropertiesSchema>({db, term}: SearchCacheOptions<S>) => {
  return search(db, {term})
})

export function searchCache<S extends PropertiesSchema>(options: SearchCacheOptions<S>): Promise<SearchResult<S>> {
  if (!options.db) throw new Error("db is required")
  if (!options.term) throw new Error("term is required")

  return cache.search(options) as Promise<SearchResult<S>>
}
