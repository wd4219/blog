const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser');
const mongoose = require('mongoose');
const session = require('koa-generic-session');
const flash_message = require('koa-flash-message');
const DB_URL = 'mongodb://localhost/myblog';
const logger = require('./config/log');
const CSRF = require('koa-csrf');
const middleware = require('./middleware/index');
mongoose.connect(DB_URL,{ useMongoClient: true});
const index = require('./routes/index')

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.keys = ['secret']
app.use(session({
  key:'ez_blog'
}));
app.use(json())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views/page/', {
  extension: 'pug'
}));

app.use(middleware.error);

app.use(logger());
//csrf
app.use(new CSRF({
  invalidSessionSecretMessage: 'Invalid session secret',
  invalidSessionSecretStatusCode: 403,
  invalidTokenMessage: 'Invalid CSRF token',
  invalidTokenStatusCode: 403,
  excludedMethods: [ 'GET', 'HEAD', 'OPTIONS' ],
  disableQuery: false
}));

app.use(middleware.help);
app.use(flash_message.default);
// routes
app.use(index.routes()).use(index.allowedMethods());

app.use(async (ctx,next)=>{
  if(!ctx.response.headerSent){
    ctx.response.status = 404;
    await ctx.render('404');
  }
})
module.exports = app
