import {test} from "node:test"
import {tspl, Plan} from "@matteo.collina/tspl"
import {promisify} from "node:util"
import {create, insert, search} from "@orama/orama"
import {createOramaCache} from "../index.js"

const sleep = promisify(setTimeout)

test("cache", async t => {
  await t.test("should cache results", async t => {
    const assert: Plan = tspl(t, {plan: 2})
    const schema = {name: "string"} as const
    const db = await create({schema})
    const cache = createOramaCache(db)

    await insert(db, {name: "foo"})
    await insert(db, {name: "bar"})

    const resultsFromOrama = await search(db, {term: "foo"})
    const resultsFromCache = await cache.search({term: "foo"})
    const resultsCachedFromOrama = await cache.search({term: "foo"})

    assert.strictEqual(resultsFromOrama.count, resultsFromCache.count)
    assert.deepStrictEqual(resultsFromCache, resultsCachedFromOrama)
  })

  await t.test("should cache results with multiple Orama istances", async t => {
    const assert: Plan = tspl(t, {plan: 2})

    const schemaWithName = {name: "string"} as const
    const schemaWithDescription = {description: "string"} as const

    const dbWithName = await create({schema: schemaWithName})
    const dbWithDescription = await create({schema: schemaWithDescription})

    const cacheWithName = createOramaCache(dbWithName)
    const cacheWithDescription = createOramaCache(dbWithDescription)

    await insert(dbWithName, {name: "foo"})
    await insert(dbWithDescription, {description: "bar"})

    const resultsWithName = await cacheWithName.search({term: "foo"})
    const resultsWithDescription = await cacheWithDescription.search({term: "bar"})

    assert.equal(resultsWithName.count, 1)
    assert.equal(resultsWithDescription.count, 1)
  })

  await t.test("should hit a cached key", async t => {
    const assert: Plan = tspl(t, {plan: 1})

    const schema = {name: "string"} as const
    const db = await create({schema})

    const cache = createOramaCache(db, {
      onHit: (key: string) => assert.deepStrictEqual(JSON.parse(key), {term: "foo"})
    })

    await insert(db, {name: "foo"})
    await cache.search({term: "foo"})
    await cache.search({term: "foo"}) // hit key!
  })

  await t.test("should miss a cached key", async t => {
    const assert: Plan = tspl(t, {plan: 1})

    const schema = {name: "string"} as const
    const db = await create({schema})

    const cache = createOramaCache(db, {
      onMiss: (key: string) => assert.deepStrictEqual(JSON.parse(key), {term: "foo"})
    })

    await insert(db, {name: "foo"})
    await cache.search({term: "foo"})
  })

  // Skip this test because timers are not working properly in node:test
  await t.test("ttl should expire a cached key", {skip: true}, async t => {
    const assert: Plan = tspl(t, {plan: 2})

    const schema = {name: "string"} as const
    const db = await create({schema})

    const cache = createOramaCache(db, {
      ttl: 1,
      onMiss: (key: string) => {
        assert.deepStrictEqual(JSON.parse(key), {term: "foo"})
      }
    })

    await insert(db, {name: "foo"})
    await cache.search({term: "foo"})

    await sleep(2000)

    await cache.search({term: "foo"}) // miss the expired key!
  })

  await t.test("clear should clear the cache", async t => {
    const assert: Plan = tspl(t, {plan: 2})

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
