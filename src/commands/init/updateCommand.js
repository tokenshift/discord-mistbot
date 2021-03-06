const show = require('./showCommand')
const Initiative = require("./Initiative")

async function update(context) {
  let {arguments, message, message: {channel}} = context

  let init = new Initiative(channel.id)

  if (!await init.load()) {
    message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  let updates = Initiative.parseCharacterList(arguments, 'wits')

  if (!updates) {
    await message.reply(update.shortHelp)
    return
  }

  for (let {name, wits} of updates) {
    let char = init.find(name)

    if (!char) {
      await message.reply(update.shortHelp)
      return
    }

    char.wits = wits
  }

  await init.save()
  await show(context)
}

update.shortHelp = 'usage: `mb init update {character} {wits}`'
update.fullHelp = `> **mb init update {character} {wits}**
Modify the Wits score of a character already in the initiative list.`

module.exports = update