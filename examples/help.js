'use strict'
const cac = require('../')

const cli = cac(`
  Usage:
    man bash
  
  Options:
    -v, --version:    Print version
    -h, --help:       Print help
`)

cli.parse()
