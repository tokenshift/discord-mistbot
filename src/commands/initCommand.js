const show = require('./init/showCommand')
const start = require('./init/startCommand')

const subcommands = {
  help,
  show: require('./init/showCommand'),
  start: require('./init/startCommand'),
  join: require('./init/joinCommand'),
  move: require('./init/moveCommand'),
  mv: require('./init/moveCommand'),
  clear: require('./init/clearCommand'),
  stop: require('./init/stopCommand'),
  end: require('./init/stopCommand')
}

async function help ({message: {channel}}) {
  channel.send({embed: {
    title: 'Mistbot Initiative Commands',
    description: init.fullHelp
  }})
}

help.shortHelp = 'usage: `mb init help`'
help.fullHelp = `> **mb init help**
Show this help text.`

function init (context) {
  let { arguments, message } = context
  let subcommand = arguments[0]

  if (subcommand) {
    subcommand = subcommands[subcommand]
    if (subcommand) {
      context.arguments = context.arguments.slice(1)
      subcommand(context)
    } else {
      message.reply('try `mb init help`.')
    }
  } else {
    show(context)
  }
}

init.shortHelp = 'usage: `mb init [subcommand]`'
init.fullHelp = [...new Set(Object.values(subcommands))]
  .map(c => c.fullHelp)
  .join('\n\n')

/* Pending commands:

\`mb init move|mv {character name} {new order}\`
Move a character to a new position in the initiative order (regardless of Wits or pool size).

\`mb init update {character} {wits}\`
Modify the Wits score of a character already in the initiative list.

\`mb init remove|rm {character names...}\`
Remove characters from initiative order. Can specify characters to remove by name or initiative order.

\`mb init pool [character] {pool size}\`
Declare the size of your own pool, or the size of another character's pool.

\`mb init spend [character] {count}\`
Spend {count} dice out of your own die pool, or the identified [character]'s pool. Will automatically roll that many dice for you.
*/

module.exports = init