export default class CacError extends Error {
  constructor(message) {
    super(message)
    this.name = 'CacError'
  }
}
