import test from "node:test"
import assert from "node:assert"
import {promisify} from "node:util"
import {create, insert, search} from "@orama/orama"
import {createOramaCache} from "../index.js"

const sleep = promisify(setTimeout)

test.describe("cache", async () => {
  test.it("should cache results", async () => {
    const schema = {name: "string"} as const
    const db = await create({schema})
    const cache = await createOramaCache(db)

    await insert(db, {name: "foo"})
    await insert(db, {name: "bar"})

    const resultsFromOrama = await search(db, {term: "foo"})
    const resultsFromCache = await cache.search({term: "foo"})
    const resultsCachedFromOrama = await cache.search({term: "foo"})

    assert.strictEqual(resultsFromOrama.count, resultsFromCache.count)
    assert.deepStrictEqual(resultsFromCache, resultsCachedFromOrama)
  })

  test.it("should cache results with multiple Orama istances", async () => {
    const schemaWithName = {name: "string"} as const
    const schemaWithDescription = {description: "string"} as const

    const dbWithName = await create({schema: schemaWithName})
    const dbWithDescription = await create({schema: schemaWithDescription})

    const cacheWithName = await createOramaCache(dbWithName)
    const cacheWithDescription = await createOramaCache(dbWithDescription)

    await insert(dbWithName, {name: "foo"})
    await insert(dbWithDescription, {description: "bar"})

    const resultsWithName = await cacheWithName.search({term: "foo"})
    const resultsWithDescription = await cacheWithDescription.search({term: "bar"})

    assert.deepEqual(resultsWithName.count, 1)
    assert.deepEqual(resultsWithDescription.count, 1)
  })

  test.it("should hit a cached key", async () => {
    // test.plan(1)

    const schema = {name: "string"} as const
    const db = await create({schema})

    const cache = await createOramaCache(db, {
      onHit: (key: string) => assert.deepStrictEqual(JSON.parse(key), {term: "foo"})
    })

    await insert(db, {name: "foo"})
    await cache.search({term: "foo"})
    await cache.search({term: "foo"}) // hit key!
  })

  test.it("should miss a cached key", async () => {
    // t.plan(1)

    const schema = {name: "string"} as const
    const db = await create({schema})

    const cache = await createOramaCache(db, {
      onMiss: (key: string) => assert.deepStrictEqual(JSON.parse(key), {term: "foo"})
    })

    await insert(db, {name: "foo"})
    await cache.search({term: "foo"})
  })

  test.it("ttl should expire a cached key", async () => {
    // test.plan(2)

    const schema = {name: "string"} as const
    const db = await create({schema})

    const cache = await createOramaCache(db, {
      ttl: 1,
      onMiss: (key: string) => assert.deepStrictEqual(JSON.parse(key), {term: "foo"})
    })

    await insert(db, {name: "foo"})
    await cache.search({term: "foo"})

    await sleep(1000)

    await cache.search({term: "foo"}) // miss the expired key!
  })

  test("clear should clear the cache", async () => {
    // test.plan(2)

    const schema = {name: "string"} as const
    const db = await create({schema})

    const cache = await createOramaCache(db, {
      onMiss: (key: string) => assert.deepStrictEqual(JSON.parse(key), {term: "foo"})
    })

    await insert(db, {name: "foo"})
    await cache.search({term: "foo"})

    cache.clear()

    await cache.search({term: "foo"}) // miss the cleaned key!
  })
})
