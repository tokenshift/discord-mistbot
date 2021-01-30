
const winston = require('winston')

module.exports = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    new winston.format.timestamp(),
    new winston.format.json()
  ),
  transports: [
    new winston.transports.Console()
  ]
})