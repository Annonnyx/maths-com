// Centralized logging with environment-based control
type LogLevel = 'error' | 'warn' | 'info' | 'debug';

const LOG_LEVELS: Record<LogLevel, number> = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3
};

const currentLogLevel = LOG_LEVELS[process.env.NODE_ENV === 'development' ? 'debug' : 'error'];

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] <= currentLogLevel;
}

export const logger = {
  error: (message: string, ...args: any[]) => {
    if (shouldLog('error')) {
      console.error(`[ERROR] ${message}`, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (shouldLog('warn')) {
      console.warn(`[WARN] ${message}`, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (shouldLog('info')) {
      console.info(`[INFO] ${message}`, ...args);
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (shouldLog('debug')) {
      console.debug(`[DEBUG] ${message}`, ...args);
    }
  }
};
