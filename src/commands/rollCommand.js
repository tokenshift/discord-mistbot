const roll = require('../roll')

/**
 * See p.146 of the Mistborn core book.
 */
const outcomes = {
  6: 'a _godlike_',
  5: 'a _legendary_',
  4: 'an _astounding_',
  3: 'an _amazing_',
  2: 'an _excellent_',
  1: 'a _good_',
  0: 'a _passable_',
  [-1]: 'a _just shy_',
  [-2]: 'an _unfortunate_',
  [-3]: 'a _cringe-worthy_',
  [-4]: 'a _horrible_',
  [-5]: 'a _disastrous_',
  [-6]: 'a _catastrophic_'
}

async function rollCommand ({reader, message, message: {channel}}) {
  let count = reader.getInt()
  let difficulty = reader.getInt()

  if (count == null || count < 0) {
    await channel.send(rollCommand.shortHelp)
    return
  }

  if (difficulty != null && (difficulty < 1 || difficulty > 5)) {
    await channel.send(rollCommand.shortHelp)
    return
  }

  let result = roll(count)

  if (difficulty) {
    let outcome = result.result - difficulty
    await channel.send(`${message.author} rolled ${outcomes[outcome]} ${result.text()}`)
  } else {
    await channel.send(`${message.author} rolled ${outcomes[outcome]} ${result.text()}`)
  }
}

rollCommand.shortHelp = 'usage: `mb roll {pool} [difficulty (1-5)]`'
rollCommand.fullHelp = `> **mb roll {pool} [difficulty (1-5)]**
Roll a pool of dice, Mistborn style.`

module.exports = rollCommand