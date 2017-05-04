const util = require('./util')

exports = module.exports = class Download {
  constructor(booru, path) {
    Object.assign(util.$(this), {booru, path})
  }

  get name() {
    let {path} = util.$(this)
    return path.match(/[^\/]+([?#].*)?$/)[0]
  }

  request() {
    let {booru, path} = util.$(this)
    return booru.requestRaw({path})
  }

  async download() {
    let response = await this.request()

    let dataArray = []
    response.on('data', chunk => dataArray.push(chunk))
    await (new Promise(r => response.on('end', r)))

    return Buffer.concat(dataArray)
  }
}
