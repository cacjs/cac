require('babel-register')
const cac = require('../../../src').default
const pkg = require('./_mock-pkg')

cac({ pkg }).parse()
