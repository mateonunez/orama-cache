import {test} from "tap"
import {promisify} from "util"
import {create, insert} from "@orama/orama"
import {createOramaCache} from ".."
const sleep = promisify(setTimeout)

const searchable = {term: "foo", relevance: {k: 0, b: 0, d: 0}}

test("cache", async ({test}) => {
  test("should cache search results", async t => {
    t.plan(2)

    const db = await create({schema: {name: "string"}})
    const cache = await createOramaCache(db)
    await insert(db, {name: "foo"})
    await insert(db, {name: "bar"})

    const results1 = await cache.search({term: "foo"})
    const resultsCached = await cache.search({term: "foo"})

    t.equal(results1, resultsCached)

    const results2 = await cache.search({term: "bar"})
    t.equal(results2.count, 1)
  })
})

test("should cache results with multiple Lyra instances", async t => {
  t.plan(2)

  const db1 = await create({schema: {name: "string"}})
  const db2 = await create({schema: {description: "string"}})

  const cache = await createOramaCache(db1)
  const cache2 = await createOramaCache(db2)

  await insert(db1, {name: "foo"})
  await insert(db2, {description: "foo"})

  const results1 = await cache.search({term: "foo"})
  const results2 = await cache2.search({term: "foo"})

  t.equal(results1.count, 1)
  t.equal(results1.count, results2.count)
})

test("should hit a cached key", async t => {
  t.plan(1)

  const db = await create({schema: {name: "string"}})

  const cache = await createOramaCache(db, {
    onHit: (key: string) => t.same(JSON.parse(key), searchable)
  })

  await insert(db, {name: "foo"})
  await cache.search(searchable)
  await cache.search(searchable)
  await cache.search(searchable)
})

test("should miss a cached key", async t => {
  t.plan(1)

  const db = await create({schema: {name: "string"}})

  const cache = await createOramaCache(db, {
    onMiss: (key: string) => t.same(JSON.parse(key), searchable)
  })

  await insert(db, {name: "foo"})
  await cache.search(searchable)
})

test("ttl should expire a cached key", async t => {
  t.plan(2)

  const db = await create({schema: {name: "string"}})

  const cache = await createOramaCache(db, {
    ttl: 1,
    onMiss: (key: string) => t.same(JSON.parse(key), searchable)
  })

  await insert(db, {name: "foo"})
  await cache.search(searchable)

  await sleep(1500)

  await cache.search(searchable)
})

test("clear should clear the cache", async t => {
  t.plan(2)

  const db = await create({schema: {name: "string"}})

  const cache = await createOramaCache(db, {
    onMiss: (key: string) => t.same(JSON.parse(key), searchable)
  })

  await insert(db, {name: "foo"})
  await cache.search(searchable)

  cache.clear()

  await cache.search(searchable)
})
