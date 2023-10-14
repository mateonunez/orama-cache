import {test, before, teardown} from "tap"

import {create, insert} from "@orama/orama"
import {createOramaCache} from ".."
import Redis from "ioredis"

const redisClient = new Redis()

before(async () => {
  await redisClient.flushall()
})

teardown(async () => {
  await redisClient.quit()
})

test("orama cache with redis storage", async t => {
  t.plan(1)

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

  t.same(results, resultsCached)
})
