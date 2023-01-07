import {create, insert} from "@lyrasearch/lyra"
import {createLyraCache, searchCache} from ".."
import {test} from "tap"

test("cache", async ({test}) => {
  test("should cache search results", async ({equal, same}) => {
    const db = create({schema: {name: "string"}})
    const lyraCache = createLyraCache()
    insert(db, {name: "foo"})
    insert(db, {name: "bar"})

    const results1 = await searchCache({db, term: "foo"}, lyraCache)
    const resultsCached = await searchCache({db, term: "foo"}, lyraCache)

    same(results1, resultsCached)

    const results2 = await searchCache({db, term: "bar"}, lyraCache)
    equal(results2.count, 1)
  })
})

test("errors", async ({test}) => {
  const lyraCache = createLyraCache()

  test("should throw an error if cache is not provided", async ({throws}) => {
    // @ts-expect-error - cache is required
    throws(() => searchCache({db: create({schema: {}}), term: "foo"}), /cache is required/)
  })

  test("should throw an error if db is not provided", async ({throws}) => {
    // @ts-expect-error - db is required
    throws(() => searchCache({term: "foo"}, lyraCache), /db is required/)
  })

  test("should throw an error if term is not provided", async ({throws}) => {
    // @ts-expect-error - term is required
    throws(() => searchCache({db: create({schema: {}})}, lyraCache), /term is required/)
  })
})

test("should cache results with multiple Lyra instances", async ({equal}) => {
  const db1 = create({schema: {name: "string"}})
  const db2 = create({schema: {description: "string"}})
  const lyraCache = createLyraCache()
  insert(db1, {name: "foo"})
  insert(db2, {description: "foo"})

  const results1 = await searchCache({db: db1, term: "foo"}, lyraCache)
  const results2 = await searchCache({db: db2, term: "foo"}, lyraCache)

  equal(results1.count, 1)
  equal(results1.count, results2.count)
})
