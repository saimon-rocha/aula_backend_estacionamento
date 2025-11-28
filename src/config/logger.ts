import pino from 'pino';
import moment from 'moment';

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: moment().format("DD/MM/YYYY HH:mm:ss"),
      messageFormat: '{msg}',
      ignore: 'pid,hostname',
    },
  },
});


export default logger;
