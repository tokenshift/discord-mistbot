const db = require('./db')

/* Helper Functions */

/**
 * Parses a list of character + wits pairs from command arguments.
 */
function parseCharacterWitsList(arguments) {
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
* Sorts characters _in-place_ by their pool size if they've all declared one,
* otherwise by their Wits score.
*/
function sortCharacters (characters) {
  if (characters.some(c => c.pool == null)) {
    characters.sort((a, b) => a.wits - b.wits)
  } else {
    characters.sort((a, b) => b.pool - a.pool)
  }
}

/* Init subcommands */

show.shortHelp = 'usage: `mb [show]`'
show.fullHelp = `\`mb [show]\`
Display the current initiative order/`
async function show ({message, message: {channel}}) {
  let record = await db.findOne({channelId: channel.id})

  if (record == null) {
    message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  let lines = []
  for (let i = 0; i < record.characters.length; ++i) {
    let char = record.characters[i]

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

  if (record.characters.length == 0) {
    lines.push('*Use `mb init join {wits score}` to join initiative.*')
  }

  if (record.initiativeMessageId) {
    // Delete the old initiative message.
    try {
      let oldMessage = await channel.messages.fetch(record.initiativeMessageId)
      oldMessage.delete()
    } catch {}
  }

  let sent = await channel.send({
    embed: {
      title: 'Mistbot Initiative Tracker',
      description: lines.join('\n')
    }
  })

  record.initiativeMessageId = sent.id
  await db.update({ _id: record._id }, record)
}

start.shortHelp = 'usage: `mb init start [{character name} {wits score} ...]`'
start.fullHelp = `\`mb init start [{character name} {wits score} ...]\`
Start tracking intitiative. Characters can optionally be listed now as pairs of \`{character name} {wits score}\`, or added later using mb init join. Add player characters using @Mentions to tie them to their own commands later (e.g. \`mb init pool\`).

Characters will initially be placed in increasing order by Wits. This can be overridden by using \`mb init move|mv\`.

Once everyone has declared their pool size, then characters will be placed in decreasing order by pool size so they can start taking actions using \`mb init spend\`.`
async function start (context) {
  let {arguments, message, message: {channel}} = context

  let characters = parseCharacterWitsList(arguments)
  if (characters == null) {
    message.reply(start.shortHelp)
    return
  }

  // Check if initiative is already being tracked.
  let record = await db.findOne({channelId: channel.id})
  if (record != null) {
    message.reply("I'm already tracking initiative in this channel! Use `mb init stop|end` to stop.")
    return
  }

  sortCharacters(characters)

  await db.insert({
    channelId: channel.id,
    characters: characters
  })

  show(context)
}

join.shortHelp = 'usage: `mb init join {wits score}` or `mb init join {character name} {wits score} ...`'
join.fullHelp = `\`mb init join {wits score}\`
Add yourself to initiative with the specified Wits score.
\`mb init join {character name} {wits score} ...\`
Add a list of character + Wits pairs to initiative.`
async function join (context) {
  let {arguments, message, message: {author, channel}} = context

  if (arguments.length == 0) {
    message.reply(join.shortHelp)
  }

  let record

  if (arguments.length == 1) {
    // Add message author with provided Wits score.
    if (/^\d+$/.test(arguments[0])) {
      record = await db.findOne({channelId: channel.id})
      record.characters.push({
        name: author.toString(),
        wits: Number(arguments[0])
      })
    } else {
      message.reply(join.shortHelp)
      return
    }
  } else {
    // Add list of character + wits pairs.
    let newChars = parseCharacterWitsList(arguments)

    if (newChars) {
      record = await db.findOne({channelId: channel.id})
      record.characters = record.characters.concat(newChars)
    } else {
      message.reply(join.shortHelp)
      return
    }
  }

  sortCharacters(record.characters)

  await db.update({_id: record._id}, record)

  show(context)
}

stop.shortHelp = 'usage: `mb init stop|end`'
stop.fullHelp = `\`mb init stop|end\`
End initiative tracking.`
async function stop ({ message, message: { channel } }) {
  let record = await db.findOne({ channelId: channel.id })
  if (!record) {
    message.reply('initiative is not currently being tracked.')
    return
  }

  if (record.initiativeMessageId) {
    // Delete the old initiative message.
    try {
      let oldMessage = await channel.messages.fetch(record.initiativeMessageId)
      await oldMessage.delete()
    } catch {}
  }

  await db.remove({ channelId: channel.id })
  message.reply('ended initiative tracking.')
}

async function clear (context) {
  let {message: {channel}} = context

  await db.update({ channelId: channel.id }, {
    $set: {
      characters: []
    }
  })

  show(context)
}

async function help ({message: {channel}}) {
  channel.send({embed: {
    title: 'Mistbot Initiative Commands',
    description: init.fullHelp
  }})
}

/* Init command */

const subcommands = {
  show,
  help,
  start,
  join,
  stop,
  clear,
  end: stop
}

init.shortHelp = 'usage: `mb init [subcommand]`'
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
function init (context) {
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
  // help (show full init help)
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

module.exports = init