import CAC from './CAC'
import Command from './Command'

/**
 * @param name The program name to display in help and version message
 */
const cac = (name = '') => new CAC(name)

export default cac
export { cac, CAC, Command }
