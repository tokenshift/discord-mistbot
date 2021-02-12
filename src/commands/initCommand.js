const show = require('./init/showCommand')
const start = require('./init/startCommand')

const subcommands = {
  help,
  show: require('./init/showCommand'),
  start: require('./init/startCommand'),
  join: require('./init/joinCommand'),
  'join!': require('./init/joinCommand'),
  move: require('./init/moveCommand'),
  mv: require('./init/moveCommand'),
  update: require('./init/updateCommand'),
  pool: require('./init/poolCommand'),
  spend: require('./init/spendCommand'),
  sort: require('./init/sortCommand'),
  remove: require('./init/removeCommand'),
  rm: require('./init/removeCommand'),
  reset: require('./init/resetCommand'),
  clear: require('./init/clearCommand'),
  stop: require('./init/stopCommand'),
  end: require('./init/stopCommand'),
  done: require('./init/stopCommand')
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

module.exports = init