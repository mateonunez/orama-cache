import {create, insert} from "@lyrasearch/lyra"
import {searchCache} from ".."
import {test} from "tap"

test("cache", async ({test}) => {
  test("should cache search results", async ({equal, same}) => {
    const db = create({schema: {name: "string"}})
    insert(db, {name: "foo"})
    insert(db, {name: "bar"})

    const results1 = await searchCache({db, term: "foo"})
    const resultsCached = await searchCache({db, term: "foo"})

    same(results1, resultsCached)

    const results2 = await searchCache({db, term: "bar"})
    equal(results2.count, 1)
  })
})

test("errors", async ({test}) => {
  test("should throw an error if db is not provided", async ({throws}) => {
    // @ts-expect-error - db is required
    throws(() => searchCache({term: "foo"}), /db is required/)
  })

  test("should throw an error if term is not provided", async ({throws}) => {
    // @ts-expect-error - term is required
    throws(() => searchCache({db: create({schema: {}})}), /term is required/)
  })
})

test("should cache results with multiple Lyra instances", async ({equal}) => {
  const db1 = create({schema: {name: "string"}})
  const db2 = create({schema: {description: "string"}})
  insert(db1, {name: "foo"})
  insert(db2, {description: "foo"})

  const results1 = await searchCache({db: db1, term: "foo"})
  const results2 = await searchCache({db: db2, term: "foo"})

  equal(results1.count, 1)
  equal(results1.count, results2.count)
})
