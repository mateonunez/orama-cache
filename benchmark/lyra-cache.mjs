import cronometro from "cronometro"
import {create, insertBatch, search} from "@lyrasearch/lyra"
import {createLyraCache} from "../dist/cjs/index.js"
import events from "./dataset/events.mjs"

const db = await create({
  schema: {
    date: "string",
    description: "string",
    categories: {
      category1: "string",
      category2: "string"
    }
  }
})

const eventsSliced = events.slice(0, 30_000)
insertBatch(db, eventsSliced)

const cache = await createLyraCache(db)

const cronometroOptions = {
  iterations: 30_000,
  print: {
    compare: true,
    compareMode: "base"
  }
}

cronometro(
  {
    "Lyra search": async () => {
      await search(db, {term: "first"})
    },
    "Lyra caching search": async () => {
      await cache.search({term: "first"})
    }
  },
  cronometroOptions
)

cronometro(
  {
    "Lyra search with properties": async () => {
      await search(db, {
        term: "b",
        properties: ["description"]
      })
    },
    "Lyra caching search with properties": async () => {
      await cache.search({
        term: "b",
        properties: ["description"]
      })
    }
  },
  cronometroOptions
)
