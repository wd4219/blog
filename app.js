const Koa = require('koa')
const app = new Koa()
const views = require('koa-views')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const mongoose = require('mongoose');
const session = require('koa-session2');
const DB_URL = 'mongodb://localhost/myblog'
mongoose.connect(DB_URL,{ useMongoClient: true});

const index = require('./routes/index')
const users = require('./routes/users')
const admin = require('./routes/admin')

// error handler
onerror(app)

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(session({
  key:'ezblog_id',
  maxAge:1000*60*60*24*7
}))
app.use(json())
app.use(logger())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views/page/', {
  extension: 'pug'
}))

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - ${ms}ms`)
})

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(admin.routes(), users.allowedMethods())

app.use(async (ctx,next)=>{
  if(ctx.response.status == 404){
    await ctx.render('404');
  }
})
module.exports = app
