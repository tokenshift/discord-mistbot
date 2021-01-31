const Initiative = require('./Initiative')
const show = require('./showCommand')

async function join (context) {
  let {arguments, message, message: {author, channel}} = context

  let init = new Initiative(channel.id)

  if (!await init.load()) {
    message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  if (arguments.length == 0) {
    message.reply(join.shortHelp)
    return
  }

  if (arguments.length == 1) {
    // Add message author with provided Wits score.
    if (/^\d+$/.test(arguments[0])) {
      init.characters.push({
        name: author.toString(),
        wits: Number(arguments[0])
      })
    } else {
      await message.reply(join.shortHelp)
      return
    }
  } else {
    // Add list of character + wits pairs.
    let newChars = Initiative.parseCharacterList(arguments)

    if (newChars) {
      init.characters = init.characters.concat(newChars)
    } else {
      await message.reply(join.shortHelp)
      return
    }
  }

  init.sortCharacters()
  await init.save()
  await show(context)
}

join.shortHelp = 'usage: `mb init join {wits score}` or `mb init join {character name} {wits score} ...`'
join.fullHelp = `\`mb init join {wits score}\`
Add yourself to initiative with the specified Wits score.
\`mb init join {character name} {wits score} ...\`
Add a list of character + Wits pairs to initiative.`

module.exports = join