type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const levelPriority: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

const currentLevel: LogLevel = (__DEV__ ? 'debug' : 'info');

export const log = (level: LogLevel, message: string, meta?: unknown) => {
  if (levelPriority[level] < levelPriority[currentLevel]) return;
  const payload = meta ? [message, meta] : [message];
  switch (level) {
    case 'debug':
      console.debug(...payload);
      break;
    case 'info':
      console.info(...payload);
      break;
    case 'warn':
      console.warn(...payload);
      break;
    case 'error':
      console.error(...payload);
      break;
    default:
      console.log(...payload);
  }
};

export const logInfo = (message: string, meta?: unknown) => log('info', message, meta);
export const logWarn = (message: string, meta?: unknown) => log('warn', message, meta);
export const logError = (message: string, meta?: unknown) => log('error', message, meta);
