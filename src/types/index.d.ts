declare module "async-cache-dedupe" {
  export type StorageOptions = {
    type: "memory" | "redis"
  }

  export type Options = {
    ttl?: number
    serialize?: (...args) => string
    onDedupe?: (...args) => void
    onError?: (...args) => void
    onHit?: (...args) => void
    onMiss?: (...args) => void
    storage?: StorageOptions
    references?: (args, key, result) => string[] | boolean
  }
  export function createCache(options: Options): {
    define: <T>(key: string, options?: Options, fn: (...args) => Promise<T>) => Promise<T>
    [key: string]: <T>(...args) => Promise<T>
  }
}
