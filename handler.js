const { parse } = require('discord-command-parser')

const init = require('./init')
const log = require('./log')
const roll = require('./roll')

// TODO: Add help command
const commands = {
  init,
  roll
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
  else {
    // TODO: Display help text.
  }
}

module.exports = handler