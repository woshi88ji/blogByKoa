const Koa = require('koa')
const Router = require('koa-router')
const path = require('path')
const static = require('./router/static')
const body = require('koa-better-body')
const session = require('koa-session')
const fs = require('fs')
const ejs = require('koa-ejs')
const {HOST} = require('./config')

// 创建服务, 端口8080
const app = new Koa()
app.listen(8080)

// 设置上传文件目录
app.use(body({
  uploadDir: path.resolve(__dirname, './static/upload')
}))

// 设置session
app.keys = fs.readFileSync('key.keys').toString().split('\n')
app.use(session({
  maxAge: 25 * 60 * 1000,  // 有效期
  renew: true,             // 自动续期
  signed: true
}, app))

// 设置路由
const router = new Router()


//配置ejs
ejs(app, {
  root: path.resolve(__dirname, 'template'),
  layout: false,
  viewExt: 'ejs',
  cache: false,
  debug: false
})
// 统一处理
router.use(async (ctx, next) => {
  try{
    await next()
  } catch (e) {
    console.log(e)
    ctx.throw(500, 'cuo le ')
  }
})
router.use('/admin', require(path.resolve(__dirname, './router/admin')))
router.use('/api', require(path.resolve(__dirname, './router/api')))
router.use('', require(path.resolve(__dirname, './router/www')))
// 静态文件读取
static(router)

// 数据库
app.context.db = require('./libs/database')

app.context.HOST = HOST

app.use(router.routes())