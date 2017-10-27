const Koa = require('koa');
const app = new Koa();
const views = require('koa-views');
const json = require('koa-json');
const bodyparser = require('koa-bodyparser');
const mongoose = require('mongoose');
const session = require('koa-session2');
const DB_URL = 'mongodb://localhost/myblog';
const winston = require('winston');
const onerror = require('koa-onerror');
onerror(app);
mongoose.connect(DB_URL,{ useMongoClient: true});
const chalk = require('chalk');
const STATUS_COLORS = {
  error: 'red',
  warn: 'yellow',
  info: 'green'
};
const index = require('./routes/index')
const users = require('./routes/users')
const admin = require('./routes/admin')
function logger(winstonInstance) {
  return async (ctx, next) => {
      const start = new Date();
      await next();
      const ms = new Date() - start;
      let logLevel;
      if (ctx.status >= 500) {
        logLevel = 'error';
        let msg = (`${ctx.method} ${ctx.originalUrl} ${logLevel} ${ctx.status} ${ms}ms ${ctx.err.message}` );
        winstonInstance.log(logLevel, msg);
      }
      else if (ctx.status >= 400) {
        logLevel = 'warn';
      }
      else if (ctx.status >= 100) {
        logLevel = 'info';
      }
      let msg = (`${ctx.method} ${ctx.originalUrl} ${logLevel} ${ctx.status} ${ms}ms`);
      winstonInstance.log(logLevel, msg);
  };
}
app.use(logger(new (winston.Logger)({
  transports: [
    new winston.transports.Console(),
    new (winston.transports.File)({
      name: 'info-file',
      filename: './log/filelog-info.log',
      level: 'info'
    }),
    new (winston.transports.File)({
      name: 'error-file',
      filename: './log/filelog-error.log',
      level: 'error'
    })
  ]
})));

// middlewares
app.use(bodyparser({
  enableTypes:['json', 'form', 'text']
}))
app.use(session({
  key:'ezblog_id',
  maxAge:1000*60*60*24*7
}))
app.use(json())
app.use(require('koa-static')(__dirname + '/public'))

app.use(views(__dirname + '/views/page/', {
  extension: 'pug'
}))

// routes
app.use(index.routes(), index.allowedMethods())
app.use(users.routes(), users.allowedMethods())
app.use(admin.routes(), users.allowedMethods())

app.on('error',async(err,ctx,next)=>{
  console.log(ctx.status);
  await ctx.render('error',err);
  
});
app.use(async (ctx,next)=>{
  if(!ctx.response.headerSent){
    ctx.response.status = 404;
    await ctx.render('404');
  }
})
module.exports = app
