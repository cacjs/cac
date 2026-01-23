import CAC from './CAC';
import Command from './Command';
/**
 * @param name The program name to display in help and version message
 */
declare const cac: (name?: string) => CAC;
export default cac;
export { cac, CAC, Command };
