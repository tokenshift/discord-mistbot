const Initiative = require('./Initiative')
const db = require('../../db')

async function show ({message, message: {channel}}) {
  let init = new Initiative(channel.id)

  if (!await init.load()) {
    message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  let lines = []
  for (let i = 0; i < init.characters.length; ++i) {
    let char = init.characters[i]

    if (char.pool) {
      if (char.remaining != null && char.remaining != char.pool) {
        lines.push(`${i+1} - ${char.name} *[Wits: ${char.wits}, Pool: ${char.remaining}/${char.pool}]*`)
      } else {
        lines.push(`${i+1} - ${char.name} *[Wits: ${char.wits}, Pool: ${char.pool}]*`)
      }
    } else {
      lines.push(`${(i+1)} - ${char.name} *[Wits: ${char.wits}]*`)
    }
  }

  if (init.characters.length == 0) {
    lines.push('*Use `mb init join {wits score}` to join initiative.*')
  }

  if (init.messageId) {
    // Delete the old initiative message.
    try {
      let oldMessage = await channel.messages.fetch(init.messageId)
      oldMessage.delete()
    } catch {}
  }

  let sent = await channel.send({
    embed: {
      title: 'Mistbot Initiative Tracker',
      description: lines.join('\n')
    }
  })

  init.messageId = sent.id
  await init.save()
}

show.shortHelp = 'usage: `mb init [show]`'
show.fullHelp = `> **mb init [show]**
Display the current initiative order/`

module.exports = show