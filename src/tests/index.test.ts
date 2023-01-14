/* eslint-disable @typescript-eslint/no-explicit-any */
import {create, insert} from "@lyrasearch/lyra"
import {createLyraCache, searchCache} from ".."
import {test} from "tap"

test("cache", async ({test}) => {
  test("should cache search results", async ({equal, same}) => {
    const db = await create({schema: {name: "string"}})
    const lyraCache = await createLyraCache()
    await insert(db, {name: "foo"})
    await insert(db, {name: "bar"})

    const results1 = await searchCache({db, term: "foo"}, lyraCache)
    const resultsCached = await searchCache({db, term: "foo"}, lyraCache)

    same(results1, resultsCached)

    const results2 = await searchCache({db, term: "bar"}, lyraCache)
    equal(results2.count, 1)
  })
})

test("errors", async ({test}) => {
  const lyraCache = await createLyraCache()

  test("should throw an error if cache is not provided", async ({same}) => {
    try {
      // @ts-expect-error - cache is required
      await searchCache({db: await create({schema: {}}), term: "foo"})
    } catch (error: any) {
      same(error.message, "cache is required")
    }
  })

  test("should throw an error if db is not provided", async ({same}) => {
    try {
      // @ts-expect-error - db is required
      await searchCache({term: "foo"}, lyraCache)
    } catch (error: any) {
      same(error.message, "db is required")
    }
  })

  test("should throw an error if term is not provided", async ({same}) => {
    try {
      // @ts-expect-error - term is required
      await searchCache({db: await create({schema: {}})}, lyraCache)
    } catch (error: any) {
      same(error.message, "term is required")
    }
  })
})

test("should cache results with multiple Lyra instances", async ({equal}) => {
  const db1 = await create({schema: {name: "string"}})
  const db2 = await create({schema: {description: "string"}})
  const lyraCache = await createLyraCache()
  await insert(db1, {name: "foo"})
  await insert(db2, {description: "foo"})

  const results1 = await searchCache({db: db1, term: "foo"}, lyraCache)
  const results2 = await searchCache({db: db2, term: "foo"}, lyraCache)

  equal(results1.count, 1)
  equal(results1.count, results2.count)
})
