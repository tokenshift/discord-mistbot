const show = require('./showCommand')
const Initiative = require("./Initiative")

async function move(context) {
  let {arguments, message, message: {channel}} = context

  let init = new Initiative(channel.id)

  if (!await init.load()) {
    message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  let updates = Initiative.parseCharacterList(arguments)

  if (!updates) {
    await message.reply(move.shortHelp)
    return
  }

  for (let {name, wits} of updates) {
    if (!init.update(name, c => c.order = wits)) {
      await message.reply(move.shortHelp)
      return
    }
  }

  await init.save()
  await show(context)
}

move.shortHelp = 'usage: `mb init move|mv {character name} {new position}'
move.fullHelp = `> **mb init move|mv {character name} {new order}**
Move a character to a new position in the initiative order (regardless of Wits or pool size).`

module.exports = move