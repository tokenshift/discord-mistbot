const show = require('./init/showCommand')
const start = require('./init/startCommand')

const subcommands = {
  help,
  show: require('./init/showCommand'),
  start: require('./init/startCommand'),
  join: require('./init/joinCommand'),
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
help.fullHelp = `\`mb init help\`
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
// TODO: generate full help from command list
init.fullHelp =`\`mb init [show]\`
Display the current initiative.

\`mb init help\`
Show this help text.

\`mb init start [{character name} {wits score} ...]\`
Start tracking intitiative. Characters can optionally be listed now as pairs of \`{character name} {wits score}\`, or added later using \`mb init join\`. Add player characters using @Mentions to tie them to their own commands later (e.g. \`mb init pool\`).

Characters will initially be placed in increasing order by Wits. This can be overridden by using \`mb init move|mv\`.

Once everyone has declared their pool size, then characters will be placed in decreasing order by pool size so they can start taking actions using \`mb init spend\`.

\`mb init join [{character name}] {wits score} ...\`
Add characters to initiative after it starts. If only a single Wits score is specified, it adds the message author themselves. Otherwise, it behaves the same way as \`mb init start\`, but adds additional characters to initiative.

Adding yourself with Wits 3: \`mb init join 3\`
Adding another character: \`mb init join "John Smith" 3\`

\`mb init remove|rm {character names...}\`
Remove characters from initiative order. Can specify characters to remove by name or initiative order.

\`mb init move|mv {character name} {new order}\`
Move a character to a new position in the initiative order (regardless of Wits or pool size).

\`mb init update {character} {wits}\`
Modify the Wits score of a character already in the initiative list.

\`mb init clear\`
Remove all characters from initiative tracking.

\`mb init pool [character] {pool size}\`
Declare the size of your own pool, or the size of another character's pool.

\`mb init spend [character] {count}\`
Spend {count} dice out of your own die pool, or the identified [character]'s pool. Will automatically roll that many dice for you.

\`mb init reset\`
Reset initiative tracking; return everybody to Wits order, and clear their pools.

\`mb init stop|end\`
End initiative tracking.`

module.exports = init