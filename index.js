require('dotenv').config()

const discord = require('discord.js')

const handler = require('./handler')
const log = require('./log')

const client = new discord.Client()

client.on('error', (err) => {
  log.error(`Error: ${err}`, { error: err })
})

client.on('ready', () => {
  log.info(`Logged in as ${client.user.tag}`, {
    user: client.user.tag
  })
});

client.on('message', handler)

client.login(process.env.DISCORD_BOT_TOKEN);