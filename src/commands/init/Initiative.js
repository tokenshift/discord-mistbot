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
   */
  sortCharacters () {
    if (this.characters.some(c => c.pool == null)) {
      this.characters.sort((a, b) => a.wits - b.wits)
    } else {
      this.characters.sort((a, b) => b.pool - a.pool)
    }
  }

  /**
   * Move a character to a new position in the initiative order, regardless of
   * their Wits score or pool size.
   */
  move (name, newPosition) {
    newPosition = Math.max(0, newPosition-1)

    // if (newPosition < 0 || newPosition > this.characters.length) {
    //   return false
    // }

    let found = null

    // Remove the character from their current position
    if (/^\d+$/.test(name)) {
      // Pick by current order
      let i = Number(name) - 1

      if (i < 0 || i >= this.characters.length) {
        return false
      }

      found = this.characters[i]

      this.characters = [
        ...this.characters.slice(0, i),
        ...this.characters.slice(i+1)
      ]
    } else {
      // Pick by name.
      let found = false

      for (let i = 0; !found && i < this.characters.length; ++i) {
        if (this.characters.name == name) {
          found = this.characters[i]
          this.characters = [
            ...this.characters.slice(0, i),
            ...this.characters.slice(i+1)
          ]
        }
      }
    }

    if (!found) {
      return false
    }

    // Add the character back in their new position.
    this.characters = [
      ...this.characters.slice(0, newPosition),
      found,
      ...this.characters.slice(newPosition)
    ]

    return true
  }
}

module.exports = Initiative