const db = require('./db')

/**
 * Parses a list of character + wits pairs from command arguments.
 */
function parseCharacterWitsList({ arguments }) {
  let characters = []

  for (let i = 0; i < arguments.length; i += 2) {
    if (i+1 >= arguments.length) {
      return null
    }

    let [name, wits] = arguments.slice(i)
    if (!/^\d+$/.test(wits)) {
      return null
    }

    wits = Number(wits)

    characters.push({
      name,
      wits
    })
  }

  return characters
}

/**
 * Display the current initiative order.
 */
async function show (args) {
  let status = await getInitiative(args)

  if (status == null) {
    args.message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  let lines = []
  for (let i = 0; i < status.characters.length; ++i) {
    let char = status.characters[i]

    if (char.pool) {
      if (char.remaining != char.pool) {
        lines.push(`${i+1} - ${char.name} *[Wits: ${char.wits}, Pool: ${char.remaining}/${char.pool}]*`)
      } else {
        lines.push(`${i+1} - ${char.name} *[Wits: ${char.wits}, Pool: ${char.pool}]*`)
      }
    } else {
      lines.push(`${(i+1)} - ${char.name} *[Wits: ${char.wits}]*`)
    }
  }

  if (status.characters.length == 0) {
    lines.push('*Use `mp init join {wits score}` to join initiative.*')
  }

  if (status.initiativeMessageId) {
    // Delete the old initiative message.
    let oldMessage = await args.message.channel.messages.fetch(status.initiativeMessageId)
    if (oldMessage) {
      oldMessage.delete()
    }
  }

  let sent = await args.message.channel.send({
    embed: {
      title: 'Mistbot Initiative Tracker',
      description: lines.join('\n')
    }
  })

  db.update({ channelId: args.message.channel.id }, {
    $set: { initiativeMessageId: sent.id }
  })
}

/**
 * Sorts characters _in-place_ by their pool size if they've all declared one,
 * otherwise by their Wits score.
 */
function sortByPoolOrWits(characters) {
  if (characters.some(c => c.pool == null)) {
    characters.sort((a, b) => b.wits - a.wits)
  } else {
    characters.sort((a, b) => b.pool - a.pool)
  }
}

async function getInitiative ({ message }) {
  let record = await db.findOne({ channelId: message.channel.id })
  return record
}

async function start (args) {
  let characters = parseCharacterWitsList(args)
  if (characters == null) {
    args.message.reply('usage: `mb init start [{character name} {wits score} ...]`')
    return
  }

  // Check if initiative is already being tracked.
  let status = await getInitiative(args)
  if (status != null) {
    args.message.reply("I'm already tracking initiative in this channel! Use `mb init stop|end` to stop.")
    return
  }

  sortByPoolOrWits(characters)

  await db.insert({
    channelId: args.message.channel.id,
    characters: characters
  })

  show(args)
}

// `mb init join {character name} {wit} [more character+wit pairs...]`
// Add characters to initiative after it starts. Will place characters in order by
// their Wit score.

// `mb init join {wit}`
// Add one's own handle to initiative with the given wit score.
join.shortHelp = 'usage: `mb init join {wits score}` or `mb init join {character name} {wits score} ...`'
join.fullHelp = `\`mb init join {wits score}\`
Add yourself to initiative with the specified Wits score.
\`mb init join {character name} {wits score} ...\`
Add a list of character + Wits pairs to initiative.`
async function join (args) {
  let { arguments, message } = args

  let status

  if (arguments.length == 0) {
    message.reply(join.shortHelp)
  }

  if (arguments.length == 1) {
    // Add message author with provided wits score.
    // TODO: Check if they're already listed.
    if (/^\d+$/.test(arguments[0])) {
      status = await getInitiative(args)
      status.characters.push({
        name: message.author.toString(),
        wits: Number(arguments[0])
      })
    } else {
      message.reply(join.shortHelp)
      return
    }
  } else {
    // Add list of character + wits pairs.
    let newChars = parseCharacterWitsList(args)

    if (newChars) {
      status = await getInitiative(args)
      status.characters = status.characters.concat(newChars)
    } else {
      message.reply(join.shortHelp)
      return
    }
  }

  sortByPoolOrWits(status.characters)

  db.update({ channelId: message.channel.id }, {
    $set: {
      characters: status.characters
    }
  })

  show(args)
}

async function stop ({ message }) {
  // TODO: Also remove initiative tracking message--once I've started updating
  // that rather than continually posting a new one.
  await db.remove({ channelId: message.channel.id })
  message.reply('ended initiative tracking.')
}

async function clear (args) {
  await db.update({ channelId: args.message.channel.id }, {
    $set: {
      characters: []
    }
  })

  show(args)
}

const subcommands = {
  show,
  start,
  join,
  stop,
  clear,
  end: stop
}

module.exports = function (args) {
  // Without any subcommand, just display the current initiative, or an error
  // if there's no initiative being tracked right now.
  //
  // Subcommands:
  // start {character name} {wit} [more character+wit pairs...]
  // join {character name} {wit} [more character+wit pairs...]
  // join {wit}
  // remove|rm` {character names...}
  // move|mv {character name} {new order}
  // pool {pool size} [character]
  // sort
  // spend {count} [character]
  // reset
  // end
  let { arguments, message } = args
  let subcommand = arguments[0]

  if (subcommand) {
    subcommand = subcommands[subcommand]
    if (subcommand) {
      args.arguments = args.arguments.slice(1)
      subcommand(args)
    } else {
      // TODO: Output `init` help
      message.reply('TODO: output `init` help')
    }
  } else {
    show(args)
  }
}