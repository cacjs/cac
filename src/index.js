import minimost from 'minimost'
import Cac from './Cac'

function cac(opts) {
  return new Cac(opts)
}

cac.parse = (...args) => minimost(...args)

export default cac
