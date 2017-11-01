//log日志
const winston = require('winston');
require('winston-daily-rotate-file');

function logger(winstonInstance) {
  winstonInstance = new (winston.Logger)({
    transports: [
      new winston.transports.Console(),
      info_logger,
      error_logger
    ]
  });
  return async (ctx, next) => {
      const start = new Date();
      await next();
      const ms = new Date() - start;
      let logLevel;
      if (ctx.status >= 500) {
        logLevel = 'error';
        let msg = (`${ctx.method}--${ctx.originalUrl}--${logLevel}--${ctx.status}--${ms}ms--${ctx.err}` );
        winstonInstance.log(logLevel, msg);
      }
      else if (ctx.status >= 400) {
        logLevel = 'warn';
        let msg = (`${ctx.method}--${ctx.originalUrl}--${logLevel}--${ctx.status}--${ms}ms`);
        winstonInstance.log(logLevel, msg);
      }
      else if (ctx.status >= 100) {
        logLevel = 'info';
        let msg = (`${ctx.method}--${ctx.originalUrl}--${logLevel}--${ctx.status}--${ms}ms`);
        winstonInstance.log(logLevel, msg);
      }
  };
}

const info_logger =  new (winston.transports.DailyRotateFile)({
  name:'info_log',
  filename: './log/info/log',
  datePattern:'yyyy-MM-dd.',
  prepend:true,
  level:'info',
  maxDays:3,
})
const error_logger = new (winston.transports.DailyRotateFile)({
  name:'error_log',
  filename: './log/error/log',
  datePattern:'yyyy-MM-dd.',
  prepend:true,
  level: 'error',
  maxDays:3
})

module.exports = logger;