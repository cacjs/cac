import minimost from 'minimost'
import Cac, { IOptions } from './Cac'
import { Opts } from 'minimist'

function cac(opts: IOptions) {
  return new Cac(opts)
}

namespace cac {
  export function parse(args: string[], opts: Opts) {
    return minimost(args, opts)
  }
}

export default cac
