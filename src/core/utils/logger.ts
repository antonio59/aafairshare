interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

export function createLogger(namespace: string): Logger {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const formatMessage = (level: string, message: string, args: any[]): string => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level}] [${namespace}] ${message} ${args.length ? JSON.stringify(args) : ''}`;
  };

  return {
    info: (message: string, ...args: any[]) => {
      console.info(formatMessage('INFO', message, args));
    },
    error: (message: string, ...args: any[]) => {
      console.error(formatMessage('ERROR', message, args));
    },
    warn: (message: string, ...args: any[]) => {
      console.warn(formatMessage('WARN', message, args));
    },
    debug: (message: string, ...args: any[]) => {
      if (isDevelopment) {
        console.debug(formatMessage('DEBUG', message, args));
      }
    }
  };
} 