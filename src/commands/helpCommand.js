module.exports = function ({message: {channel}}) {
  channel.send({embed: {
    title: 'Mistbot Commands',
    description: `\`mb help\`
Display this help text.

\`mb roll {pool}\`
Roll a pool of dice, Mistborn style.

\`mb init [subcommand]\`
Mistbot initiative tracking. See \`mb init help\` for more details.`
  }})
}