const db = require('./db')

class Channel {
  constructor(channelId) {
    this.channelId = channelId
  }

  static async find (channelId) {
    let channel = new Channel(channelId)
    if (await channel.load()) {
      return channel
    } else {
      return null
    }
  }

  async load () {
    let record = await db.findOne({ channelId: this.channelId })

    if (record) {
      Object.assign(this, record)
      return true
    } else {
      return false
    }
  }
}

module.exports = Channel