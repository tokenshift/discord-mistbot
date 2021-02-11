const show = require('./showCommand')
const Initiative = require("./Initiative")

async function pool(context) {
  let {arguments, message, message: {channel}} = context

  let init = new Initiative(channel.id)

  if (!await init.load()) {
    message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  if (arguments.length == 1) {
    // Update the size of your own pool.
    if (/^\d+$/.test(arguments[0])) {
      let pool = Number(arguments[0])
      let char = init.find(message.author.toString())

      if (!char) {
        await message.reply(pool.shortHelp)
        return
      }

      char.remaining = char.pool = pool
    } else {
      await message.reply(pool.shortHelp)
      return
    }
  } else {
    // Parse as character + pool size pairs.
    let updates = Initiative.parseCharacterList(arguments)

    if (!updates) {
      await message.reply(pool.shortHelp)
      return
    }

    for (let {name, count} of updates) {
      let char = init.find(name)

      if (!char) {
        await message.reply(pool.shortHelp)
        return
      }

      char.remaining = char.pool = count
    }
  }

  await init.save()
  await show(context)
}

pool.shortHelp = 'usage: `mb init pool {character} {pool}`'
pool.fullHelp = `> **mb init pool [{character}] {pool}**
Declare the size of your own pool, or the size of another character's pool.`

module.exports = pool