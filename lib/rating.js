const real = Symbol('real')

let ratings = new WeakMap()
exports = module.exports = class Rating {
  constructor(rating) {
    if(rating instanceof exports) rating = ratings.get(rating)

    switch(rating) {
      case 's':
      case 0:
        ratings.set(this, 0)
      break

      case 'q':
      case 1:
        ratings.set(this, 1)
      break

      case 'e':
      case 2:
        ratings.set(this, 2)
      break

      default:
        throw new TypeError('unknown rating')
      break
    }
  }

  toString() {
    switch(ratings.get(this)) {
      case 0:
        return 's'
      break
      case 1:
        return 'q'
      break
      case 2:
        return 'e'
      break
    }
  }

  valueOf() {
    return ratings.get(this)
  }

  get s() {
    return ratings.get(this) === 0
  }
  set s(value) {
    if(value) ratings.set(this, 0)
  }
  get safe() {
    return this.s
  }
  set safe(value) {
    this.s = value
  }

  get q() {
    return ratings.get(this) === 1
  }
  set q(value) {
    if(value) ratings.set(this, 1)
  }
  get questionable() {
    return this.q
  }
  set questionable(value) {
    this.q = value
  }

  get e() {
    return ratings.get(this) === 2
  }
  set e(value) {
    if(value) ratings.set(this, 2)
  }
  get explicit() {
    return this.e
  }
  set explicit(value) {
    this.e = value
  }
}
