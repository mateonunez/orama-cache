import {test} from "node:test"
import {tspl, Plan} from "@matteo.collina/tspl"
import {promisify} from "node:util"
import {create, insert} from "@orama/orama"
import {createOramaCache} from "../index.js"
import Redis from "ioredis"

const sleep = promisify(setTimeout)

// @ts-expect-error - test invalid type
const redisClient = new Redis()

test("redis storage", async t => {
  test.after(async () => {
    await redisClient.quit()
  })

  await t.test("should use redis storage", async t => {
    const assert: Plan = tspl(t, {plan: 1})

    const db = await create({
      schema: {name: "string"}
    })

    const cache = createOramaCache(db, {
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

  await t.test("should invalidate with referencesTTL", {skip: true}, async t => {
    const assert: Plan = tspl(t, {plan: 2})

    const db = await create({
      schema: {name: "string"}
    })

    const cache = createOramaCache(db, {
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
