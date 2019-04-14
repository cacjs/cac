import CAC from './CAC'

/**
 * @param name The program name to display in help and version message
 */
const cac = (name = '') => new CAC(name)

export default cac

if (typeof module !== 'undefined') {
  module.exports = cac
  module.exports.default = cac
}
