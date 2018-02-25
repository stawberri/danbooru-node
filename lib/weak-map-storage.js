module.exports = () => {
  const map = new WeakMap()

  return key => {
    if (map.has(key)) return map.get(key)

    const value = {}
    map.set(key, value)
    return value
  }
}
