const show = require('./showCommand')
const Initiative = require("./Initiative")

async function move(context) {
  let {arguments, message, message: {channel}} = context

  let init = new Initiative(channel.id)

  if (!await init.load()) {
    message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  let updates = Initiative.parseCharacterList(arguments, 'order')

  if (!updates) {
    await message.reply(move.shortHelp)
    return
  }

  for (let {name, order} of updates) {
    let i = init.findIndex(name)

    if (i < 0) {
      await message.reply(move.shortHelp)
      return
    }

    let char = init.characters[i]

    order = Math.max(0, order - 1)

    // Remove from old position
    init.characters = [
      ...init.characters.slice(0, i),
      ...init.characters.slice(i+1)
    ]

    // Add to new position
    init.characters = [
      ...init.characters.slice(0, order),
      char,
      ...init.characters.slice(order)
    ]
  }

  await init.save()
  await show(context)
}

move.shortHelp = 'usage: `mb init move|mv {character name} {new position}'
move.fullHelp = `> **mb init move|mv {character name} {new order}**
Move a character to a new position in the initiative order (regardless of Wits or pool size).`

module.exports = move