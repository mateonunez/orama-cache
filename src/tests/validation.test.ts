import {test} from "node:test"
// import {tspl, Plan} from "@matteo.collina/tspl"
import assert from "node:assert"
import {CreateCacheOptions} from "async-cache-dedupe"
import {validateOptions} from "../lib/validation.js"

test("ttl", async t => {
  await t.test("should throw if ttl is a negative number", () => {
    const options = {ttl: -1} as CreateCacheOptions
    assert.throws(() => validateOptions(options), {message: /ttl must be greater than 0/})
  })

  await t.test("should throw if ttl is not a number", () => {
    // @ts-expect-error - test invalid type
    const options = {ttl: "foo"} as CreateCacheOptions
    assert.throws(() => validateOptions(options), {message: /ttl must be a number/})
  })
})

test("stale", async t => {
  await t.test("should throw if stale is a negative number", () => {
    const options = {stale: -1} as CreateCacheOptions
    assert.throws(() => validateOptions(options), {message: /stale must be greater than 0/})
  })

  await t.test("should throw if stale is not a number", () => {
    // @ts-expect-error - test invalid type
    const options = {stale: "foo"} as CreateCacheOptions
    assert.throws(() => validateOptions(options), {message: /stale must be a number/})
  })
})

test("onDedupe", async t => {
  await t.test("should throw if onDedupe is not a function", () => {
    // @ts-expect-error - test invalid type
    const options = {onDedupe: "foo"} as CreateCacheOptions
    assert.throws(() => validateOptions(options), {message: /onDedupe must be a function/})
  })

  await t.test("should not throw if onDedupe is a function", () => {
    const options = {onDedupe: () => {}} as CreateCacheOptions
    assert.doesNotThrow(() => validateOptions(options))
  })
})

test("onError", async t => {
  await t.test("should throw if onError is not a function", () => {
    // @ts-expect-error - test invalid type
    const options = {onError: "foo"} as CreateCacheOptions
    assert.throws(() => validateOptions(options), {message: /onError must be a function/})
  })

  await t.test("should not throw if onError is a function", () => {
    const options = {onError: () => {}} as CreateCacheOptions
    assert.doesNotThrow(() => validateOptions(options))
  })
})

test("onHit", async t => {
  await t.test("should throw if onHit is not a function", () => {
    // @ts-expect-error - test invalid type
    const options = {onHit: "foo"} as CreateCacheOptions
    assert.throws(() => validateOptions(options), {message: /onHit must be a function/})
  })

  await t.test("should not throw if onHit is a function", () => {
    const options = {onHit: () => {}} as CreateCacheOptions
    assert.doesNotThrow(() => validateOptions(options))
  })
})

test("onMiss", async t => {
  await t.test("should throw if onMiss is not a function", () => {
    // @ts-expect-error - test invalid type
    const options = {onMiss: "foo"} as CreateCacheOptions
    assert.throws(() => validateOptions(options), {message: /onMiss must be a function/})
  })

  await t.test("should not throw if onMiss is a function", () => {
    const options = {onMiss: () => {}} as CreateCacheOptions
    assert.doesNotThrow(() => validateOptions(options))
  })
})

test("storage", async t => {
  await t.test("should throw if storage.type is not memory or redis", () => {
    // @ts-expect-error - test invalid type
    const options = {storage: {type: "foo"}} as CreateCacheOptions
    assert.throws(() => validateOptions(options), {message: /storage.type must be memory or redis/})
  })

  await t.test("memory", async t => {
    await t.test("should not throw if storage.type is memory", () => {
      const options = {storage: {type: "memory"}} as CreateCacheOptions
      assert.doesNotThrow(() => validateOptions(options))
    })

    await t.test("should throw if storage.type is memory and storage.options.size is a negative number", () => {
      const options = {storage: {type: "memory", options: {size: -1}}} as CreateCacheOptions
      assert.throws(() => validateOptions(options), {message: /storage.options.size must be greater than 0/})
    })

    await t.test("should throw if storage.type is memory and storage.options.size is not a number", () => {
      // @ts-expect-error - test invalid type
      const options = {storage: {type: "memory", options: {size: "foo"}}} as CreateCacheOptions
      assert.throws(() => validateOptions(options), {message: /storage.options.size must be a number/})
    })

    await t.test("size", async t => {
      await t.test("should set storage.options.size to 1000 if not defined", () => {
        const options = {storage: {type: "memory"}} as const
        const validated = validateOptions(options)
        assert.strictEqual(validated.storage.options.size, 1000)
      })

      await t.test("should throw if storage.type is memory and storage.options.size is a negative number", () => {
        const options = {storage: {type: "memory", options: {size: -1}}} as CreateCacheOptions
        assert.throws(() => validateOptions(options), {message: /storage.options.size must be greater than 0/})
      })
    })
  })

  await t.test("redis", async t => {
    await t.test("should not throw if storage.type is redis with options", () => {
      const options = {storage: {type: "redis", options: {client: {}}}} as unknown as CreateCacheOptions
      assert.doesNotThrow(() => validateOptions(options))
    })

    await t.test("should throw if storage.type is redis without options", () => {
      const options = {storage: {type: "redis"}} as CreateCacheOptions
      assert.throws(() => validateOptions(options), {message: /storage.options must be defined/})
    })

    await t.test("should throw if storage.type is redis and storage.options is not defined", () => {
      const options = {storage: {type: "redis"}} as CreateCacheOptions
      assert.throws(() => validateOptions(options), {message: /storage.options must be defined/})
    })

    await t.test("should throw if storage.type is redis and storage.options.client is not defined", () => {
      const options = {storage: {type: "redis", options: {}}} as CreateCacheOptions
      assert.throws(() => validateOptions(options), {message: /storage.options.client is required/})
    })

    await t.test("invalidation", async t => {
      await t.test("should throw if storage.type is redis and storage.options.invalidation.invalidate is not set", () => {
        const options = {storage: {type: "redis", options: {client: {}, invalidation: {}}}} as CreateCacheOptions
        assert.throws(() => validateOptions(options), {message: /storage.options.invalidation.invalidate must be a boolean/})
      })

      await t.test("should throw if storage.type is redis and storage.options.invalidation.invalidate is not a boolean", () => {
        // @ts-expect-error - test invalid type
        const options = {storage: {type: "redis", options: {client: {}, invalidation: {invalidate: -1}}}} as CreateCacheOptions
        assert.throws(() => validateOptions(options), {message: /storage.options.invalidation.invalidate must be a boolean/})
      })

      await t.test("should throw if storage.type is redis and storage.options.invalidation.referencesTTL is not a number", () => {
        // @ts-expect-error - test invalid type
        const options = {storage: {type: "redis", options: {client: {}, invalidation: {invalidate: true, referencesTTL: "foo"}}}} as CreateCacheOptions
        assert.throws(() => validateOptions(options), {message: /storage.options.invalidation.referencesTTL must be a number/})
      })

      await t.test("should throw if storage.type is redis and storage.options.invalidation.referencesTTL is a negative number", () => {
        const options = {storage: {type: "redis", options: {client: {}, invalidation: {invalidate: true, referencesTTL: -1}}}} as CreateCacheOptions
        assert.throws(() => validateOptions(options), {message: /storage.options.invalidation.referencesTTL must be greater than 0/})
      })

      await t.test("should not throw if storage.type is redis and storage.options.invalidation.referencesTTL is a positive number", () => {
        const options = {storage: {type: "redis", options: {client: {}, invalidation: {invalidate: true, referencesTTL: 1}}}} as CreateCacheOptions
        assert.doesNotThrow(() => validateOptions(options))
      })
    })
  })
})
