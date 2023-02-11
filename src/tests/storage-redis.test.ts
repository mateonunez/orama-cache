import {create, insert} from "@lyrasearch/lyra"
import {createLyraCache} from ".."
import {test, before, teardown} from "tap"
import Redis from "ioredis"

const redisClient = new Redis()

before(async () => {
  await redisClient.flushall()
})

teardown(async () => {
  await redisClient.quit()
})

test("lyra cache with redis storage", async t => {
  t.plan(1)

  const db = await create({schema: {name: "string"}})
  const cache = await createLyraCache(db, {
    storage: {
      type: "redis",
      options: {
        client: redisClient
      }
    }
  })

  await insert(db, {name: "foo"})
  await insert(db, {name: "bar"})

  const results = await cache.search({term: "foo"})
  const resultsCached = await cache.search({term: "foo"})

  t.same(results, resultsCached)
})
