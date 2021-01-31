
const show = require('./showCommand')
const Initiative = require("./Initiative")

async function remove(context) {
  let {arguments, message, message: {channel}} = context

  let init = new Initiative(channel.id)

  if (!await init.load()) {
    message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  if (arguments.length != 1) {
    await message.reply(remove.shortHelp)
    return
  }

  if (!init.remove(arguments[0].trim())) {
    await message.reply(remove.shortHelp)
    return
  }

  await init.save()
  await show(context)
}

remove.shortHelp = 'usage: `mb init remove|rm {character names}`'
remove.fullHelp = `> **mb init remove|rm {character names}**
Remove characters from initiative order. Can specify characters to remove by name or initiative order.`

module.exports = remove