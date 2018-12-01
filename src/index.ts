import CAC from './CAC'

/**
 * @param name The program name to display in help and version message
 */
const cac = (name = '') => new CAC(name)

export = cac
