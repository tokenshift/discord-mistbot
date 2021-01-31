const show = require('./showCommand')
const Initiative = require('./Initiative')

async function reset (context) {
  let {message: {channel}} = context

  let init = new Initiative(channel.id)

  if (!await init.load()) {
    await message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  for (let char of init.characters) {
    delete char.pool
    delete char.remaining
  }

  await init.save()
  await show(context)
}

reset.shortHelp = 'usage: `mb init reset`'
reset.fullHelp = `> **mb init reset**
Reset all characters' pools for the next round of combat.`

module.exports = reset