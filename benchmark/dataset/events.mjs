import dataset from "./events.json" assert {type: "json"}

function normalizeEvents(events) {
  return events.map(({date, description, category1, category2}) => ({
    date,
    description,
    categories: {
      category1,
      category2
    }
  }))
}

export default normalizeEvents(dataset.result.events)
