const Router = require('koa-router')
const {getDate} = require('../../libs/common')

let router = new Router()


router.get('/', async ctx => {
  ctx.redirect(`${ctx.HOST}/index`)
})

router.get('/index', async ctx => {
  let artical_data = await ctx.db.query(`SELECT type, id, add_time, title, essentials , read_num FROM artical_ WHERE frozed=0 ORDER BY id DESC LIMIT 10`)
  artical_data.forEach(item => {
    item.add_time = getDate(item.add_time)
 })
  let host_artical = await ctx.db.query('SELECT title, id FROM artical_ WHERE frozed=0 ORDER BY read_num DESC   LIMIT 5')
  await ctx.render('www/index', {
    host: ctx.HOST,
    artical_data: artical_data,
    host_artical: host_artical
  })
})


router.get('/index/js', async ctx => {
  let artical_data = await ctx.db.query(`SELECT type, id, add_time, title, essentials,  read_num FROM artical_ WHERE type='javascript' AND frozed=0 ORDER BY id DESC LIMIT 10`)
  artical_data.forEach(item => {
    item.add_time = getDate(item.add_time)
  })
  let host_artical = await ctx.db.query(`SELECT title, id FROM artical_ WHERE type='javascript' AND frozed=0 ORDER BY read_num DESC   LIMIT 5`)
  await ctx.render('www/t_js', {
    host: ctx.HOST,
    artical_data: artical_data,
    host_artical: host_artical
  })
})

router.get('/index/node', async ctx => {
  let artical_data = await ctx.db.query(`SELECT type, add_time, id, title, essentials,  read_num FROM artical_ WHERE type='nodejs' AND frozed=0 ORDER BY id DESC LIMIT 10`)
  artical_data.forEach(item => {
    item.add_time = getDate(item.add_time)
  })
  let host_artical = await ctx.db.query(`SELECT title, id FROM artical_ WHERE type='nodejs' AND frozed=0 ORDER BY read_num DESC   LIMIT 5`)
  await ctx.render('www/t_node', {
    host: ctx.HOST,
    artical_data: artical_data,
    host_artical: host_artical
  })
})

router.get('/index/wx', async ctx => {
  let artical_data = await ctx.db.query(`SELECT type, add_time,id,  title, essentials,  read_num FROM artical_ WHERE type='小程序' AND frozed=0 ORDER BY id DESC LIMIT 10`)
  artical_data.forEach(item => {
    item.add_time = getDate(item.add_time)
  })
  let host_artical = await ctx.db.query(`SELECT title, id FROM artical_ WHERE type='小程序' AND frozed=0 ORDER BY read_num DESC   LIMIT 5`)
  await ctx.render('www/t_wx', {
    host: ctx.HOST,
    artical_data: artical_data,
    host_artical: host_artical
  })
})


router.get('/index/detail', async ctx => {
  let { id } = ctx.request.query 
  await ctx.db.query(`UPDATE artical_ SET read_num = read_num+1 WHERE id = ${id}`)
  let data = await ctx.db.query(`SELECT type,id, add_time, title, artical, essentials, read_num FROM artical_ WHERE id='${id}'`)
  data.forEach(item => {
    item.add_time = getDate(item.add_time)
  })
  let host_artical = await ctx.db.query(`SELECT title, id FROM artical_ WHERE  frozed=0 ORDER BY read_num DESC   LIMIT 5`)
  await ctx.render('www/detail', {
    host: ctx.HOST,
    data: data[0],
    host_artical
  })
})


module.exports = router.routes()