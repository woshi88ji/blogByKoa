const Router = require('koa-router')

let router = new Router()

router.get('/index', async ctx => {
  await ctx.render('www/index', {
    host: ctx.HOST
  })
})

module.exports = router.routes()