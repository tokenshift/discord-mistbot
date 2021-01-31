function roll(count) {
}

function roll(pool) {
  // Pool sizes above 10 or below 2 count as 10 with nudges, or 2 with a
  // worsening outcome.
  let effectiveCount = Math.max(2, Math.min(10, pool))

  let rolls = Array(effectiveCount).fill().map(_ => Math.floor(Math.random() * 6 + 1))

  return rolls.reduce((result, roll) => {
    result.rollCounts[roll] += 1

    if (roll == 6) {
      result.nudges += 1
    } else if (result.rollCounts[roll] >= 2) {
      result.result = Math.max(result.result, roll)
    }

    return result
  }, {
    pool: pool,
    rolls: rolls,
    rollCounts: {
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0
    },
    result: 0,
    nudges: Math.max(0, pool - effectiveCount),
    worsen: Math.max(0, 2 - pool)
  })
}

function rollText(result) {
  let parts = [`rolled a **${result.result}**`]

  if (result.nudges > 0) {
    parts.push(` with *${result.nudges} ${result.nudges > 1 ? 'nudges' : 'nudge'}*`)
  }

  if (result.worsen > 0) {
    parts.push(`, outcome *worsened by ${result.worsen}*`)
  }

  parts.push(` (${result.rolls.length}d6: ${
    result.rolls.map(r => r == result.result ? `**${r}**` : r).join(', ')
  })`)

  return parts.join('')
}

module.exports = function ({reader, message, message: {channel}}) {
  let count = reader.getInt()
  if (count == null || count < 0) {
    channel.send('usage: `mb roll {pool size}`')
    return
  }

  let result = roll(count)
  let text = rollText(result)
  channel.send(`${message.author} ${text}`)
}