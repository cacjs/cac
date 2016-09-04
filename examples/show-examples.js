'use strict'
const cac = require('../')

const cli = cac()

cli
  .example('lovely-command init lovely-project')
  .example('lovely-command gh -p')
  .parse()
