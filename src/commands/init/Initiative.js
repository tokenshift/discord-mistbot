const db = require('../../db')

function namesMatch(name1, name2) {
  if (name1.trim() == name2.trim()) {
    return true
  }

  // Check for names in @Mention format, for example:
  // <@!539945878522167316>
  // <@539945878522167316>

  let [
    match1,
    match2
  ] = [
    name1.match(/<@(!)?(\d+)>/),
    name2.match(/<@(!)?(\d+)>/)
  ]

  if (match1 && match2 && match1[2] == match2[2]) {
    return true
  }

  return false;
}

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

      characters.push({
        name: name.trim(),
        wits: Number(wits)
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
    // Remove characters marked `deleted: true`.
    this.characters = this.characters.filter(c => !c.deleted)

    // Trim whitespace from all character names.
    for (let char of this.characters) {
      char.name = char.name.trim()
    }

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
   *
   * If the `order` attribute is set on a character, this will override the
   * Wits/pool ordering.
   */
  sortCharacters () {
    if (this.characters.some(c => c.pool == null)) {
      this.characters.sort((a, b) => a.wits - b.wits)
    } else {
      this.characters.sort((a, b) => b.pool - a.pool)
    }
  }

  /**
   * Find an existing character by name or position in initiative order.
   * @param {string|int} name - Character's name or position in initiative order.
   * @returns the character that was found (or null).
   */
  find (name) {
    let i = this.findIndex(name)

    if (i >= 0) {
      return this.characters[i]
    } else {
      return null
    }
  }

  /**
   * Find an existing character by name or position in initiative order.
   * @param {string|int} name - Character's name or position in initiative order.
   * @returns the index of the character, or -1.
   */
  findIndex (name) {
    if (/^\d+$/.test(name)) {
      // Pick by current order
      let i = Number(name) - 1

      if (i < 0 || i >= this.characters.length) {
        return -1
      }

      return i
    } else {
      // Pick by name.
      for (let i = 0; i < this.characters.length; ++i) {
        if (namesMatch(this.characters[i].name, name)) {
          return i
        }
      }
    }

    return -1
  }
}

module.exports = Initiative