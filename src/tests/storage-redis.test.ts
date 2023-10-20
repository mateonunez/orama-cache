import test from "node:test"
import assert from "node:assert"
import {promisify} from "node:util"
import {create, insert} from "@orama/orama"
import {createOramaCache} from "../index.js"
import Redis from "ioredis"

const sleep = promisify(setTimeout)

const redisClient = new Redis()

test.describe("redis storage", () => {
  test.after(async () => {
    await redisClient.quit()
  })

  test.it("should use redis storage", async () => {
    const db = await create({
      schema: {name: "string"}
    })

    const cache = await createOramaCache(db, {
      storage: {
        type: "redis",
        options: {
          client: redisClient
        }
      }
    })

    await insert(db, {name: "foo"} as never)

    const results = await cache.search({term: "foo"})
    const resultsCached = await cache.search({term: "foo"})

    assert.deepStrictEqual(results, resultsCached)
  })

  test.skip("should invalidate with referencesTTL", async () => {
    // test.plan(2)
    const db = await create({
      schema: {name: "string"}
    })

    const cache = await createOramaCache(db, {
      storage: {
        type: "redis",
        options: {
          client: redisClient,
          invalidation: {
            invalidate: true,
            referencesTTL: 1 // 1 minute
          }
        }
      }
    })

    await insert(db, {name: "aaa"} as never)

    await cache.search({term: "aaa"})
    await sleep(60_000)

    const keys = await redisClient.keys("*")
    assert.deepStrictEqual(keys, [])
  })
})
