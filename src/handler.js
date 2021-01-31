const { parse } = require('discord-command-parser')

const log = require('./log')

const commands = {
  help,
  roll: require('./commands/rollCommand'),
  init: require('./commands/initCommand')
}

async function help ({message: {channel}}) {
  channel.send({embed: {
    title: 'Mistbot Commands',
    description: Object.values(commands)
      .map(c => c.fullHelp)
      .join('\n\n')
  }})
}

help.shortHelp = 'usage: `mb help`'
help.fullHelp = `> **mb help**
Display this help text.`

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