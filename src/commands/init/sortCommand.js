
const show = require('./showCommand')
const Initiative = require("./Initiative")

async function sort(context) {
  let {arguments, message, message: {channel}} = context

  let init = new Initiative(channel.id)

  if (!await init.load()) {
    message.reply('use `mb init start` to start tracking initiative.')
    return
  }

  init.sortCharacters()

  await init.save()
  await show(context)
}

sort.shortHelp = 'usage: `mb init sort`'
sort.fullHelp = `> **mb init sort**
Sort the initiative list by Wits or pool size.`

module.exports = sort