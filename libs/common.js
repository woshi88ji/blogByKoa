const crypto = require('crypto')

module.exports = {
  md5(buffer) {
    let hash = crypto.createHash('md5')
    hash.update(buffer)
    return hash.digest('hex')
  },
  getDate(date) {
    let dat = new Date(date)
    let d = date.getDate() > 9 ? date.getDate() + '' : '0' + date.getDate()
    let y = date.getFullYear()
    let M = date.getMonth() + 1 > 9? date.getMonth() + 1 + '' : '0' + (date.getMonth() + 1)
    let h = date.getHours() >9? date.getHours() + '' : '0' + date.getHours()
    let m = date.getMinutes() >9? date.getMinutes() + '' : '0' + date.getMinutes()
    let s = date.getSeconds() > 9 ? date.getSeconds() + '' : '0' + date.getSeconds()
    return `${y}-${M}-${d} ${h}:${m}:${s}`
  }
}