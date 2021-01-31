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
   */
  sortCharacters () {
    if (this.characters.some(c => c.pool == null)) {
      this.characters.sort((a, b) => a.wits - b.wits)
    } else {
      this.characters.sort((a, b) => b.pool - a.pool)
    }
  }

  /**
   * Find and update an existing character.
   * @param {string|int} name - Character's name or position in initiative order.
   * @param {function} updateFn - Function to be applied to the character (if found).
   * * If you set the `order` attribute of the character to a number, it will be
   * reordered at the next save.
   * * If you set the `deleted` attribute of the character to `true`, it will be
   * removed from the list of characters at the next save.
   * @returns true if the character was found (by name or position).
   */
  update (name, updateFn) {
    let index = -1

    if (/^\d+$/.test(name)) {
      // Pick by current order
      let i = Number(name) - 1

      if (i < 0 || i >= this.characters.length) {
        return false
      }

      index = i
    } else {
      // Pick by name.
      for (let i = 0; i < this.characters.length; ++i) {
        if (namesMatch(this.characters[i].name, name)) {
          index = i
          break
        }
      }
    }

    if (index < 0) {
      return false
    }

    let found = this.characters[index]

    updateFn(found)

    // Remove characters marked `deleted: true`.
    if (found.deleted) {
      this.characters = [
        ...this.characters.slice(0, index),
        ...this.characters.slice(index+1)
      ]
    }

    // Re-order characters that have an `order` attribute applied.
    if (found.order != null) {
      found.order = Math.max(0, found.order - 1)

      // Remove from old position
      this.characters = [
        ...this.characters.slice(0, index),
        ...this.characters.slice(index+1)
      ]

      // Add to new position
      this.characters = [
        ...this.characters.slice(0, found.order),
        found,
        ...this.characters.slice(found.order)
      ]

      delete found.order
    }

    return true
  }
}

module.exports = Initiative