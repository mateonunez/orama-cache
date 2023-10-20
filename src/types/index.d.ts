import type {SearchResult, SearchParams} from "@orama/orama/dist/methods/search"

export type OptionsMemory = {
  size?: number
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

export type StorageType = "memory" | "redis"

export type StorageOptions = {type: Extract<StorageType, "memory">; options?: OptionsMemory} | {type: Extract<StorageType, "redis">; options: OptionsRedis}

export type CreateCacheOptions = {
  ttl?: number
  stale?: number
  onDedupe?: (...args) => void
  onError?: (...args) => void
  onHit?: (key: string) => void
  onMiss?: (key: string) => void
  storage?: StorageOptions
}

export type ValidatedCacheOptions<T extends "memory" | "redis"> = Omit<CreateCacheOptions, "storage"> & {
  storage: Required<StorageOptions & {type: T}>
}

declare module "async-cache-dedupe" {
  export function createCache<T>(options: CreateCacheOptions): {
    define: (key: string, options?: Options, fn: (...args) => Promise<T>) => Promise<T>
    clear: () => void

    search: (params: SearchParams<T>) => Promise<SearchResult<T>>
  }
}
