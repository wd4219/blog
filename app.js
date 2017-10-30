const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser');
const mongoose = require('mongoose');
const session = require('koa-session2');
const DB_URL = 'mongodb://localhost/myblog';
const logger = require('./config/log');
const CSRF = require('koa-csrf');
mongoose.connect(DB_URL,{ useMongoClient: true});

const index = require('./routes/index')
const users = require('./routes/users')
const admin = require('./routes/admin')

app.use(logger());
// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(session({
  key:'ezblog_id',
  maxAge:1000*60*60
}))
app.use(json())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views/page/', {
  extension: 'pug'
}))

// csrf
app.use(new CSRF({
  invalidSessionSecretMessage: 'Invalid session secret',
  invalidSessionSecretStatusCode: 403,
  invalidTokenMessage: 'Invalid CSRF token',
  invalidTokenStatusCode: 403,
  excludedMethods: [ 'GET', 'HEAD', 'OPTIONS' ],
  disableQuery: false
}));

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(admin.routes(), users.allowedMethods())

app.use(async (ctx,next)=>{
  if(!ctx.response.headerSent){
    ctx.response.status = 404;
    await ctx.render('404');
  }
})
module.exports = app
