const db = require('../../db')

class Initiative {
  constructor (channelId) {
    this.channelId = channelId
    this.characters = []
    this.messageId = null
  }

  /**
   * Parses a list of character + wits pairs from command arguments.
   */
  static parseCharacterList (args) {
    let characters = []

    for (let i = 0; i < args.length; i += 2) {
      if (i+1 >= args.length) {
        return null
      }

      let [name, wits] = args.slice(i)
      if (!/^\d+$/.test(wits)) {
        return null
      }

      wits = Number(wits)

      characters.push({
        name,
        wits
      })
    }

    return characters
  }

  /**
   * Load the initiative record from the database.
   */
  async load () {
    let record = await db.findOne({
      type: 'Initiative',
      channelId: this.channelId
    })

    if (record) {
      Object.assign(this, record)
      return true
    } else {
      return false
    }
  }

  /**
   * Save the initiative record to the database.
   */
  async save () {
    await db.update({
      type: 'Initiative',
      channelId: this.channelId
    }, {
      $set: this
    }, {
      upsert: true
    })
  }

  /**
   * Delete the initiative record.
   */
  async delete () {
    await db.remove({
      type: 'Initiative',
      channelId: this.channelId
    }, {
      multi: true
    })
  }

  /**
   * Sorts characters _in-place_ by their pool size (ascending) if they've all
   * declared one, otherwise by their Wits score (descending).
   */
  sortCharacters () {
    if (this.characters.some(c => c.pool == null)) {
      this.characters.sort((a, b) => a.wits - b.wits)
    } else {
      this.characters.sort((a, b) => b.pool - a.pool)
    }
  }
}

module.exports = Initiative