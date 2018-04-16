declare module 'string-width' {
  let stringWidth: (str: string) => number
  export default stringWidth
}

declare module 'text-table' {
  export type TabelData = [string, string][]
  interface Options {
    stringLength(str: string): number
  }
  type TextTable = (data: TabelData, options: Options) => string
  let textTable: TextTable
  export default textTable
}
