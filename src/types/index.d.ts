import type {SearchResult, SearchParams} from "@orama/orama/dist/methods/search"

export type OptionsMemory = {
  size: number
  invalidation?: boolean
  log?: object
}

type OptionsRedis = {
  client: object
  invalidation?:
    | boolean
    | {
        invalidate: boolean
        referencesTTL?: number
      }
  log?: object
}

type StorageOptions = {
  type: "memory" | "redis"
  options?: OptionsMemory | OptionsRedis
}

export type CreateCacheOptions = {
  ttl?: number
  stale?: number
  onDedupe?: (...args) => void
  onError?: (...args) => void
  onHit?: (key: string) => void
  onMiss?: (key: string) => void
  storage?: StorageOptions
}

export type ValidatedCacheOptions = {
  ttl: number
  stale?: number
  onDedupe?: (...args) => void
  onError?: (...args) => void
  onHit?: (key: string) => void
  onMiss?: (key: string) => void
  storage: StorageOptions
}

declare module "async-cache-dedupe" {
  export function createCache<T>(options: CreateCacheOptions): {
    define: (key: string, options?: Options, fn: (...args) => Promise<T>) => Promise<T>
    clear: () => void

    search: (params: SearchParams<T>) => Promise<SearchResult<T>>
  }
}
