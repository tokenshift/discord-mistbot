const Initiative = require('./Initiative')

async function stop ({ message, message: { channel } }) {
  let init = new Initiative(channel.id)

  if (!await init.load()) {
    message.reply('initiative is not currently being tracked.')
    return
  }

  if (init.messageId) {
    // Delete the old initiative message.
    try {
      let oldMessage = await channel.messages.fetch(init.messageId)
      await oldMessage.delete()
    } catch {}
  }

  await init.delete()
  await message.reply('ended initiative tracking.')
}

stop.shortHelp = 'usage: `mb init stop|end`'
stop.fullHelp = `\`mb init stop|end\`
End initiative tracking.`

module.exports = stop