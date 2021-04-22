import CAC from './CAC'
import Command from './Command'

/**
 * @param name The program name to display in help and version message
 */
const cac = (name = '') => new CAC(name)

export default cac
export { cac, CAC, Command }

if (typeof module !== 'undefined') {
  // @remove-for-deno
  module.exports = cac
  Object.assign(module.exports, {
    default: cac,
    cac,
    CAC,
    Command,
  })
}
