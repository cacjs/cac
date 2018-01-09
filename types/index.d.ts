declare module 'cac' {
  export default function cac(): CAC

  export interface CAC {
    option: Options['add']
    command: (
      name: string,
      option?: string | CommandOption,
      handler?: CommandHandler
    ) => Command
    parse: (argv?: string[] | null, option?: ParseOption) => void
    showHelp: () => void
    use: (plugin: CacPlugin | CacPlugin[]) => void
    /** The filename of executed file. */
    bin: string
    /** Parsed CLI arguments. */
    argv: {
      input: string[],
      flags: any
    }
    extraHelp: (help: string | ExtraHelp) => void
    on: (event: EventName, handler: EventHandler) => void
  }

  interface OptionOption {
    /** Option description. */
    desc?: string
    /** Option alias. */
    alias?: string | string[]
    /** Option type. */
    type?: 'boolean' | 'string'
    /** Whether the option is required or not. */
    required?: boolean
    /** Limit valid values for the option. */
    choices?: any[]
  }

  interface CommandOption {
    /** Command description. */
    desc?: string
    /** Command alias. */
    alias?: string | string[]
    /** Command examples. */
    examples?: string[]
    /** Some other options from plugins. */
    [key: string]: any
  }

  type CommandHandler = (input: string[], flags: any) => any

  interface ParseOption {
    run?: boolean
  }

  type CacPlugin = (ctx: CAC) => any

  interface ExtraHelp {
    /** Title of the help. */
    title: string
    /** Body of the help. */
    body: string
  }

  interface Options {
    options: OptionOption[]
    add: (name: string, option?: OptionOption) => Options
  }

  interface Command {
    command: CommandOption
    handler?: CommandHandler
    options: Options
    option: Options['add']
  }

  type EventName = 'parsed' | 'executed'
  type EventHandler = (command: Command, input: string[], flags: any) => any
}
