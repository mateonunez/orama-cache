import cronometro from "cronometro"
import {create, insertMultiple, search} from "@orama/orama"
import {createOramaCache} from "../dist/cjs/index.js"
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
insertMultiple(db, eventsSliced)

const cache = await createOramaCache(db)

const cronometroOptions = {
  iterations: 30_000,
  print: {
    compare: true,
    compareMode: "base"
  }
}

cronometro(
  {
    "Orama search": async () => {
      await search(db, {term: "first"})
    },
    "Orama caching search": async () => {
      await cache.search({term: "first"})
    }
  },
  cronometroOptions
)

cronometro(
  {
    "Orama search with properties": async () => {
      await search(db, {
        term: "b",
        properties: ["description"]
      })
    },
    "Orama caching search with properties": async () => {
      await cache.search({
        term: "b",
        properties: ["description"]
      })
    }
  },
  cronometroOptions
)
