
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

  let char = init.find(arguments[0].trim())

  if (!char) {
    await message.reply(remove.shortHelp)
    return
  }

  char.deleted = true

  await init.save()
  await show(context)
}

remove.shortHelp = 'usage: `mb init remove|rm {character name}`'
remove.fullHelp = `> **mb init remove|rm {character name}**
Remove a character from initiative order. Can specify character to remove by name or initiative order.`

module.exports = remove