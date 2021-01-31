const { parse } = require('discord-command-parser')

const init = require('./init')
const log = require('./log')
const roll = require('./roll')

function help ({message: {channel}}) {
  channel.send({embed: {
    title: 'Mistbot Help',
    description: `\`mb help\`
Display this help text.

\`mb roll {pool}\`
Roll a pool of dice, Mistborn style.

\`mb init [subcommand]\`
Mistbot initiative tracking. See \`mb init help\` for more details.`
  }})
}

const commands = {
  help,
  roll,
  init
}

async function handler (msg) {
  let parsed = parse(msg, 'mb ', {
    allowSpaceBeforeCommand: true
  })

  if (!parsed.success) {
    return
  }

  let cmd = commands[parsed.command]
  if (cmd) {
    log.info(`${msg.author.tag} sent command '${parsed.command}' in '${msg.channel.guild.name} - #${msg.channel.name}'`, {
      sender: {
        author: msg.author.tag,
        guildName: msg.channel.guild.name,
        guildId: msg.channel.guild.id,
        channelName: msg.channel.name,
        channelId: msg.channel.id
      },
      command: parsed.command,
      args: parsed.arguments
    })

    cmd(parsed)
  }
}

module.exports = handler