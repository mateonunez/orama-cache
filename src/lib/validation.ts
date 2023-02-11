import {CreateCacheOptions, OptionsMemory, OptionsRedis, ValidatedCacheOptions} from "async-cache-dedupe"

export function validateOptions(options: CreateCacheOptions): ValidatedCacheOptions {
  const validated = options

  // TTL validation number and greater than 0
  if (validated.ttl !== undefined && (validated.ttl < 0 || typeof validated.ttl !== "number")) {
    throw new Error("ttl must be greater than 0")
  } else if (validated.ttl === undefined) {
    validated.ttl = 60
  }

  // Stale validation number and greater than 0
  if (validated.stale !== undefined && (validated.stale < 0 || typeof validated.stale !== "number")) {
    throw new Error("stale must be greater than 0")
  }

  // onDedupe validation
  if (options.onDedupe && typeof options.onDedupe !== "function") {
    throw new Error("onDedupe must be a function")
  }

  // onError validation
  if (options.onError && typeof options.onError !== "function") {
    throw new Error("onError must be a function")
  }

  // onHit validation
  if (options.onHit && typeof options.onHit !== "function") {
    throw new Error("onHit must be a function")
  }

  // onMiss validation
  if (options.onMiss && typeof options.onMiss !== "function") {
    throw new Error("onMiss must be a function")
  }

  // Storage validation
  if (options.storage) {
    if (options.storage.type === "memory") {
      const optionsMemory = options.storage.options as OptionsMemory

      if (optionsMemory) {
        if (optionsMemory.size && optionsMemory.size < 0) {
          throw new Error("storage.options.size must be greater than 0")
        }
      } else if (!optionsMemory) {
        validated.storage = {
          type: "memory",
          options: {
            size: 1000
          }
        }
      }
    } else if (options.storage.type === "redis") {
      const optionsRedis = options.storage.options as OptionsRedis

      if (optionsRedis) {
        if (!optionsRedis.client || (optionsRedis.client && typeof optionsRedis.client !== "object")) {
          throw new Error("storage.options.client is required")
        }

        if (optionsRedis.invalidation && typeof optionsRedis.invalidation === "object") {
          if (typeof optionsRedis.invalidation.invalidate !== "boolean") {
            throw new Error("storage.options.invalidation.invalidate must be a boolean")
          }

          if (typeof optionsRedis.invalidation.referencesTTL === "number" && optionsRedis.invalidation.referencesTTL < 0) {
            throw new Error("storage.options.invalidation.referencesTTL must be greater than 0")
          }
        }
      } else {
        throw new Error("storage.options must be defined")
      }
    } else {
      throw new Error("storage.type must be memory or redis")
    }
  }

  return validated as ValidatedCacheOptions
}
