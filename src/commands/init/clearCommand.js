const show = require('./showCommand')
const Initiative = require('./Initiative')

async function clear (context) {
  let {message: {channel}} = context

  let init = new Initiative(channel.id)

  if (await init.load()) {
    init.characters = []
    await init.save()
    await show(context)
  } else {
    await message.reply('use `mb init start` to start tracking initiative.')
  }
}

clear.shortHelp = 'usage: `mb init clear`'
clear.fullHelp = `\`mb init clear\`
Remove all characters from initiative tracking.`

module.exports = clear