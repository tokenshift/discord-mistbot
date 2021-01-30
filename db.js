const Datastore  = require('nedb-promises')

const log = require('./log')

const DATABASE_FILENAME = process.env.DATABASE_FILENAME || 'mistbot.nedb'

let db = Datastore.create({ filename: DATABASE_FILENAME })

db.loadDatabase((err) => {
  if (err) {
    log.error(`Error loading database: ${err}`, {
      error: err,
      filename: DATABASE_FILENAME
    })
    process.exit(1)
  } else {
    log.info(`Loaded database at ${DATABASE_FILENAME}`, {
      filename: DATABASE_FILENAME
    })
  }
})

module.exports = db

