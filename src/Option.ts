import { removeBrackets } from './utils'

interface OptionConfig {
  default?: any
}

export default class Option {
  names: string[]
  isBoolean?: boolean
  // `required` will be a boolean for options with brackets
  required?: boolean
  config: OptionConfig
  negated?: boolean

  constructor(
    public rawName: string,
    public description: string,
    config?: OptionConfig
  ) {
    this.config = Object.assign({}, config)

    this.names = removeBrackets(rawName)
      .split(',')
      .map((v: string) => {
        let name = v.trim().replace(/^-{1,2}/, '')
        if (name.startsWith('no-')) {
          this.negated = true
          name = name.replace(/^no-/, '')
        }
        return name
      })
      .sort((a, b) => (a.length > b.length ? 1 : -1)) // Sort names

    if (this.negated) {
      this.config.default = true
    }

    if (rawName.includes('<')) {
      this.required = true
    } else if (rawName.includes('[')) {
      this.required = false
    } else {
      // No arg needed, it's boolean flag
      this.isBoolean = true
    }
  }
}

export { OptionConfig }
