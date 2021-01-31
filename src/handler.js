const { parse } = require('discord-command-parser')

const log = require('./log')
const help = require('./commands/helpCommand')
const init = require('./commands/initCommand')
const roll = require('./commands/rollCommand')

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