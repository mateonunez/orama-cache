import {CreateCacheOptions, OptionsMemory, ValidatedCacheOptions} from "async-cache-dedupe"
import {test} from "tap"
import {validateOptions} from "../lib/validation"

test("should validate ttl", ({plan, throws}) => {
  plan(1)

  const options = {ttl: -1} as CreateCacheOptions
  throws(() => {
    validateOptions(options)
  }, "ttl must be greater than 0")
})

test("should validate stale", ({plan, throws}) => {
  plan(2)

  const options = {stale: -1} as CreateCacheOptions
  throws(() => {
    validateOptions(options)
  }, "stale must be greater than 0")

  // @ts-expect-error - stale is a number
  const options2 = {stale: "foo"} as CreateCacheOptions
  throws(() => {
    validateOptions(options2)
  }, "stale must be greater than 0")
})

test("should validate onDedupe", ({plan, throws}) => {
  plan(1)

  // @ts-expect-error - onDedupe is a function
  const options = {onDedupe: "foo"} as CreateCacheOptions
  throws(() => {
    validateOptions(options)
  }, "onDedupe must be a function")
})

test("should validate onError", ({plan, throws}) => {
  plan(1)

  // @ts-expect-error - onError is a function
  const options = {onError: "foo"} as CreateCacheOptions
  throws(() => {
    validateOptions(options)
  }, "onError must be a function")
})

test("should validate onHit", ({plan, throws}) => {
  plan(1)

  // @ts-expect-error - onHit is a function
  const options = {onHit: "foo"} as CreateCacheOptions
  throws(() => {
    validateOptions(options)
  }, "onHit must be a function")
})

test("should validate onMiss", ({plan, throws}) => {
  plan(1)

  // @ts-expect-error - onMiss is a function
  const options = {onMiss: "foo"} as CreateCacheOptions
  throws(() => {
    validateOptions(options)
  }, "onMiss must be a function")
})

test("should validate storage", async () => {
  test("should validate storage type", async ({plan, throws}) => {
    plan(1)

    // @ts-expect-error - storage is memory or redis
    const options = {storage: {type: "foo"}} as CreateCacheOptions
    throws(() => {
      validateOptions(options)
    }, "storage.type must be memory or redis")
  })

  // memory storage tests
  test("should validate memory storage", async () => {
    test("should set default size as 1000", async ({plan, same}) => {
      plan(1)

      const options = {storage: {type: "memory"}} as CreateCacheOptions
      const validatedOptions = validateOptions(options) as ValidatedCacheOptions
      same((validatedOptions?.storage.options as OptionsMemory).size, 1000)
    })

    test("should throw if size is less than 0", async ({plan, throws}) => {
      plan(1)

      const options = {storage: {type: "memory", options: {size: -1}}} as CreateCacheOptions
      throws(() => {
        validateOptions(options)
      }, "storage.options.size must be greater than 0")
    })
  })

  // redis storage tests
  test("should validate redis storage", async () => {
    test("should validate redis storage client", async ({plan, throws}) => {
      plan(1)

      // @ts-expect-error - client is an object
      const options = {storage: {type: "redis", options: {client: "foo"}}} as CreateCacheOptions
      throws(() => {
        validateOptions(options)
      }, "storage.options.client is required")
    })

    test("should validate redis storage invalidation", async () => {
      test("should throw if options are not defined", async ({plan, throws}) => {
        plan(1)

        const options = {storage: {type: "redis"}} as CreateCacheOptions
        throws(() => {
          validateOptions(options)
        }, "storage.options.invalidation must be defined")
      })

      test("should throw if invalidate is not a boolean", async ({plan, throws}) => {
        plan(1)

        // @ts-expect-error - invalidate is a boolean
        const options = {storage: {type: "redis", options: {client: {}, invalidation: {invalidate: "foo"}}}} as CreateCacheOptions
        throws(() => {
          validateOptions(options)
        }, "storage.options.invalidation must be a boolean")
      })

      test("should throw if referencesTTL is less than 0", async ({plan, throws}) => {
        plan(1)

        const options = {storage: {type: "redis", options: {client: {}, invalidation: {invalidate: false, referencesTTL: -1}}}} as CreateCacheOptions
        throws(() => {
          validateOptions(options)
        }, "storage.options.invalidation.referencesTTL must be greater than 0")
      })

      test("should throw if client is not an object", async ({plan, throws}) => {
        plan(1)

        // @ts-expect-error - client is not defined
        const options = {storage: {type: "redis", options: {client: undefined}}} as CreateCacheOptions
        throws(() => {
          validateOptions(options)
        }, "storage.options.client is required")
      })
    })
  })
})
