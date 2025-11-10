import pino from 'pino';

const isDev = process.env.NODE_ENV !== 'production';

const logger = pino({
  level: 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'dd/MM/yyyy HH:mm:ss',
      messageFormat: '{msg}',
      ignore: 'pid,hostname',
    },
  },
});


export default logger;
