const roll = require('../../roll')
const show = require('./showCommand')
const Initiative = require("./Initiative")

async function spend(context) {
  let {arguments, message, message: {channel}} = context

  let init = new Initiative(channel.id)

  if (!await init.load()) {
    message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  if (arguments.length == 1) {
    // Spend from author's pool.
    if (/^\d+$/.test(arguments[0])) {
      let dice = Number(arguments[0])
      let char = init.find(message.author.toString())

      if (!char) {
        await message.reply(pool.shortHelp)
        return
      }

      if (char.remaining == null) {
        char.remaining = char.pool
      }

      if (char.remaining == 0) {
        await message.reply('you don\'t have any dice left!')
        return
      }

      if (char.remaining < dice) {
        await message.reply(`you only have ${char.remaining} ${char.remaining > 1 ? 'dice' : 'die'} left to spend!`)
        return
      }

      char.remaining -= dice

      let result = roll(dice)
      await channel.send(`${message.author} ${result.text()}`)
    } else {
      await message.reply(spend.shortHelp)
      return
    }
  } else {
    // Parse as list of character + pool pairs.
    let updates = Initiative.parseCharacterList(arguments)

    if (!updates) {
      await message.reply(spend.shortHelp)
      return
    }

    for (let {name, count} of updates) {
      let char = init.find(name)

      if (!char) {
        await message.reply(spend.shortHelp)
        return
      }

      if (char.remaining == null) {
        char.remaining = char.pool
      }

      if (char.remaining == 0) {
        await channel.send(`${char.name} doesn't have any dice left!`)
        return
      }

      if (char.remaining < dice) {
        await channel.send(`${char.name} only has ${char.remaining} ${char.remaining > 1 ? 'dice' : 'die'} left to spend!`)
        return
      }

      char.remaining -= count

      let result = roll(count)
      await channel.send(`${message.author} ${result.text()}`)
    }
  }

  await init.save()
  await show(context)
}

spend.shortHelp = 'usage: `mb init spend {character} {dice}`'
spend.fullHelp = `> **mb init spend [character] {dice}**
Spend \`{count}\` dice out of your own die pool, or the identified \`[character]\`'s pool. Will automatically roll that many dice for you.`

module.exports = spend