declare module 'string-width' {
  let stringWidth: (str: string) => number
  export default stringWidth
}

declare module 'text-table' {
  export type TabelData = string[][]
  interface Options {
    stringLength(str: string): number
  }
  type TextTable = (data: TabelData, options: Options) => string
  let textTable: TextTable
  export default textTable
}

declare module 'redent' {
  type Redent = (str: string, count?: number, char?: string) => string
  const redent: Redent
  export default redent
}
