/* eslint-disable @typescript-eslint/no-explicit-any */
import {create, insert} from "@lyrasearch/lyra"
import {createLyraCache} from ".."
import {test} from "tap"
import {promisify} from "util"

const sleep = promisify(setTimeout)

test("cache", async ({test}) => {
  test("should cache search results", async ({plan, same}) => {
    plan(2)

    const db = await create({schema: {name: "string"}})
    const cache = await createLyraCache(db)
    await insert(db, {name: "foo"})
    await insert(db, {name: "bar"})

    const results1 = await cache.search({term: "foo"})
    const resultsCached = await cache.search({term: "foo"})

    same(results1, resultsCached)

    const results2 = await cache.search({term: "bar"})
    same(results2.count, 1)
  })
})

test("should cache results with multiple Lyra instances", async ({plan, same}) => {
  plan(2)

  const db1 = await create({schema: {name: "string"}})
  const db2 = await create({schema: {description: "string"}})

  const cache = await createLyraCache(db1)
  const cache2 = await createLyraCache(db2)

  await insert(db1, {name: "foo"})
  await insert(db2, {description: "foo"})

  const results1 = await cache.search({term: "foo"})
  const results2 = await cache2.search({term: "foo"})

  same(results1.count, 1)
  same(results1.count, results2.count)
})

test("should hit a cached key", async ({plan, same}) => {
  plan(1)

  const db = await create({schema: {name: "string"}})
  const searchable = {term: "foo"}

  const cache = await createLyraCache(db, {
    onHit: (key: string) => same(key, JSON.stringify(searchable))
  })

  await insert(db, {name: "foo"})
  await cache.search(searchable)
  await cache.search(searchable)
})

test("should miss a cached key", async ({plan, same}) => {
  plan(1)

  const db = await create({schema: {name: "string"}})
  const searchable = {term: "foo"}

  const cache = await createLyraCache(db, {
    onMiss: (key: string) => same(key, JSON.stringify(searchable))
  })

  await insert(db, {name: "foo"})
  await cache.search(searchable)
})

test("ttl should expire a cached key", async ({same}) => {
  const db = await create({schema: {name: "string"}})
  const searchable = {term: "foo"}

  const cache = await createLyraCache(db, {
    ttl: 1,
    onMiss: (key: string) => same(key, JSON.stringify(searchable))
  })

  await insert(db, {name: "foo"})
  await cache.search(searchable)

  await sleep(1500)

  await cache.search(searchable)
})

test("clear should clear the cache", async ({same}) => {
  const db = await create({schema: {name: "string"}})
  const searchable = {term: "foo"}

  const cache = await createLyraCache(db, {
    onMiss: (key: string) => same(key, JSON.stringify(searchable))
  })

  await insert(db, {name: "foo"})
  await cache.search(searchable)

  cache.clear()

  await cache.search(searchable)
})
