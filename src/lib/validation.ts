import {CreateCacheOptions, OptionsMemory, OptionsRedis, StorageType, ValidatedCacheOptions} from "async-cache-dedupe"

export function validateOptions<T extends CreateCacheOptions>(options: T): ValidatedCacheOptions<Extract<T["storage"], {type: StorageType}>["type"]> {
  let validated: CreateCacheOptions = {...options}

  validated = validateTTL(validated)
  validated = validateStale(validated)
  validated = validateFunctionProperties(validated)
  validated = validateStorage(validated)

  return validated as ValidatedCacheOptions<Extract<T["storage"], {type: StorageType}>["type"]>
}

function validateTTL(options: CreateCacheOptions): CreateCacheOptions {
  return {
    ...options,
    ttl: ensureNumberAndPositive(options.ttl, "ttl", 60)
  }
}

function validateStale(options: CreateCacheOptions): CreateCacheOptions {
  return {
    ...options,
    stale: ensureNumberAndPositive(options.stale, "stale", 60)
  }
}

function validateFunctionProperties(options: CreateCacheOptions): CreateCacheOptions {
  const functionProperties: (keyof CreateCacheOptions)[] = ["onDedupe", "onError", "onHit", "onMiss"]

  for (const prop of functionProperties) {
    if (options[prop] && typeof options[prop] !== "function") {
      throw new Error(`${prop} must be a function`)
    }
  }

  return options
}

function validateStorage(options: CreateCacheOptions): CreateCacheOptions {
  if (!options.storage) {
    return {...options, storage: {type: "memory", options: {size: 1000}}}
  } else if (options.storage.type === "memory") {
    return {
      ...options,
      storage: {
        ...options.storage,
        options: validateMemoryStorage(options.storage.options)
      }
    }
  } else if (options.storage.type === "redis") {
    return {
      ...options,
      storage: {
        ...options.storage,
        options: validateRedisStorage(options.storage.options)
      }
    }
  } else {
    throw new Error("storage.type must be memory or redis")
  }
}

function validateMemoryStorage(optionsMemory?: OptionsMemory): OptionsMemory {
  const defaultOptions: OptionsMemory = {size: 1000}
  const resultOptions = optionsMemory ?? defaultOptions

  if (!resultOptions.size || typeof resultOptions.size !== "number") {
    throw new Error("storage.options.size must be a number")
  } else if (resultOptions.size && resultOptions.size < 0) {
    throw new Error("storage.options.size must be greater than 0")
  }
  return resultOptions
}

function validateRedisStorage(optionsRedis: OptionsRedis): OptionsRedis {
  if (!optionsRedis) {
    throw new Error("storage.options must be defined")
  }

  if (!optionsRedis.client || typeof optionsRedis.client !== "object") {
    throw new Error("storage.options.client is required")
  }
  if (typeof optionsRedis.invalidation !== "boolean") {
    if (optionsRedis.invalidation && typeof optionsRedis.invalidation.invalidate !== "boolean") {
      throw new Error("storage.options.invalidation.invalidate must be a boolean")
    }

    ensureNumberAndPositive(optionsRedis.invalidation?.referencesTTL, "storage.options.invalidation.referencesTTL", 60)
  }
  return optionsRedis
}

function ensureNumberAndPositive(value: unknown, propertyName: string, defaultValue?: number): number {
  let resultValue = value
  if (resultValue === undefined && defaultValue !== undefined) {
    resultValue = defaultValue
  }

  if (typeof resultValue !== "number") {
    throw new Error(`${propertyName} must be a number`)
  } else if (resultValue < 0) {
    throw new Error(`${propertyName} must be greater than 0`)
  }

  return resultValue
}
