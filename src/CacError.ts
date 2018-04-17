export default class CacError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CacError'
  }
}
