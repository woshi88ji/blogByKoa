const Router = require('koa-router')
const path = require('path')
const fs = require('await-fs')
const { md5, getDate } = require('../../libs/common')
const { suffix } = require('../../config')
const svgCaptcha = require('svg-captcha')


let router = new Router()

router.get('/login', async ctx => {
  await ctx.render('admin/login', {
    host: ctx.HOST,
    errmsg: ctx.query.errmsg
  })
})

router.get('/captcha', async ctx => {
  let captcha = svgCaptcha.create({
    width: 100,
    height: 40
  })
  let time = new Date().getTime()
  
  let cap = captcha.text.toLowerCase()
  ctx.session['captcha'] = cap
  // await ctx.db.query(`INSERT INTO captcha  (token, cap) VALUES ('${time}', '${cap}')`)
  ctx.response.type = 'image/svg+xml'
  ctx.body = captcha.data
})



router.post('/login', async ctx => {
  let { user, pass, cap } = ctx.request.fields
  let admin = JSON.parse(await fs.readFile(path.resolve(__dirname, '../../admin.json')))
  const result = md5(pass + suffix)
  let db_cap = ctx.session['captcha']
  if (cap.toLowerCase() != db_cap) {
    ctx.redirect(`${ctx.HOST}/admin/login?errmsg=${encodeURIComponent('验证码有误')}`)
  } else {
    let userInfo = admin.filter(item => {
      return item.username == user
    })[0]
    if (!userInfo) {
      ctx.redirect(`${ctx.HOST}/admin/login?errmsg=${encodeURIComponent('用户不存在')}`)
    } else {
      if (userInfo.password === result) {
        ctx.session.token = userInfo.sessionId
        ctx.redirect(`${ctx.HOST}/admin/admin`)
      } else {
        ctx.redirect(`${ctx.HOST}/admin/login?errmsg=${encodeURIComponent('密码错误')}`)
      }
    }
  }

})

router.all('*', async (ctx, next) => {
  if (ctx.session.token) {
    await next()
  } else {
    ctx.redirect(`${ctx.HOST}/admin/login`)
  }
})

// 后台首页
router.get('/admin', async ctx => {
  let count = await ctx.db.query('SELECT COUNT(*) FROM artical_')
  let count1 = await ctx.db.query('SELECT COUNT(*) FROM artical_ WHERE frozed=1')
  let read = await ctx.db.query('SELECT read_num FROM artical_ ')
  let readNum = 0
  read.forEach(item => {
    readNum = item.read_num + readNum
  })
  await ctx.render('admin/admin', {
    host: ctx.HOST,
    artical_count: count[0]['COUNT(*)'],
    frozed_count: count1[0]['COUNT(*)'],
    readNum

  })
})

// 编辑文章
router.get('/artical', async ctx => {
  let { id } = ctx.request.query
  let data = {}
  if (id) {
    let artical_data = await ctx.db.query(`SELECT type, add_time, id, title, artical, essentials FROM artical_ WHERE id=${id}`)
    data = artical_data[0]
  }
  await ctx.render('admin/add_artical', {
    host: ctx.HOST,
    data: data
 })
})

router.post('/artical', async ctx => {
  let { id } = ctx.request.query
  let { title, type, artical, essentials } = ctx.request.fields
  if (id) {
    await ctx.db.query(`UPDATE artical_ SET type='${type}', title='${title}', artical='${artical}', essentials='${essentials}' WHERE id='${id}'`)
  } else {
    await ctx.db.query(`INSERT INTO artical_ (title, type, artical, essentials, add_time, read_num) VALUES ('${title}','${type}','${artical}','${essentials}', '${getDate(new Date()).toString()}', 0)`)
  }
  
  ctx.body = 'ok'
  // await ctx.redirect(`${ctx.HOST}/admin/add_artical`)
})


// 文章删除
router.delete('/delete', async ctx => {
  let { id } = ctx.request.query
  await ctx.db.query(`DELETE FROM artical_ WHERE id=${id}`)
  ctx.body = {
    code: 200,
    msg: ''
  }
})

// 登出
router.get('/logout', async ctx => {
  ctx.session.token = null
  await ctx.redirect(`${ctx.HOST}/admin/login`)
})

// 修改密码
router.get('/change_pass', async ctx => {
  await ctx.render('admin/change_password', {
    host: ctx.HOST
  })
})

router.post('/change_pass', async ctx => {
  await ctx.redirect(`${ctx.HOST}/admin/admin`, {
    host: ctx.HOST
  })
})

// 文件上传
router.post('/uploadImg', async ctx => {
  let data = ctx.request.fields
  // console.log(data.myFileName)
  let address = data.myFileName[0].path.split('/').reverse()[0]
  ctx.body = {
    error: 0,
    data: [`${ctx.HOST}/upload/${address}`]
  }
})

// 文章管理
router.get('/manage', async ctx => {
  await ctx.render('admin/manage', {
    host: ctx.HOST
  })
})

// 文章列表数据
router.get('/blog-list', async ctx => {
  let { page, limit } = ctx.request.query
  let count = await ctx.db.query('SELECT COUNT(*) FROM artical_')
  let data =  await ctx.db.query(`SELECT id, type, add_time, title, read_num, frozed FROM artical_ WHERE id > 0 ORDER BY id DESC LIMIT ${(page-1) * limit}, ${limit}`)
  data.forEach(item => {
    item.add_time = getDate(item.add_time)
  })
  ctx.body = {
    code: 0,
    count: count[0]['COUNT(*)'],
    data: data
  }
})

//修改冻结
router.post('/change_frozed', async ctx => {
  let { id, frozed } = ctx.request.fields
  await ctx.db.query(`UPDATE artical_ SET frozed='${frozed}' WHERE id='${id}'`)
  ctx.body = 'ok'
})


module.exports = router.routes()