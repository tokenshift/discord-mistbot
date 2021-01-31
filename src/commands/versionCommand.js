const package = require('../../package.json')

async function version ({message: {channel}}) {
  await channel.send(`Mistbot version: ${package.version}`)
}

version.shortHelp = 'usage: `mb version`'
version.fullHelp = `> **mb version**
Display the current Mistbot version number.`

module.exports = version