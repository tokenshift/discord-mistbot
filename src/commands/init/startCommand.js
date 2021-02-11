const Initiative = require('./Initiative')
const show = require('./showCommand')

async function start (context) {
  let {arguments, message, message: {channel}} = context

  let characters = Initiative.parseCharacterList(arguments, 'wits')
  if (characters == null) {
    message.reply(start.shortHelp)
    return
  }

  let init = new Initiative(channel.id)
  if (await init.load()) {
    message.reply("I'm already tracking initiative in this channel! Use `mb init stop|end` to stop.")
    return
  }

  init.characters = characters
  init.sortCharacters()
  await init.save()

  show(context)
}

start.shortHelp = 'usage: `mb init start [{character name} {wits score} ...]`'
start.fullHelp = `> **mb init start [{character name} {wits score} ...]**
Start tracking intitiative. Characters can optionally be listed now as pairs of \`{character name} {wits score}\`, or added later using mb init join. Add player characters using @Mentions to tie them to their own commands later (e.g. \`mb init pool\`).

Characters will initially be placed in increasing order by Wits. This can be overridden by using \`mb init move|mv\`.

Once everyone has declared their pool size, then characters will be placed in decreasing order by pool size so they can start taking actions using \`mb init spend\`.`

module.exports = start