const winston = require('winston');

const appRoot = require('app-root-path');
require('events').EventEmitter.defaultMaxListeners = 40;

const loggers = {};
const SPLAT = Symbol.for('splat');
const safeStringify = require('fast-safe-stringify');
// padding in log messages
const padding = '                                                 ';

// define the formatter for Winston
// this is aimed at being a singleton
const formatter = (name) =>
    winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.metadata({
            fillExcept: ['message', 'level', 'timestamp', 'label'],
        }),
        winston.format.padLevels(),
        winston.format.printf((info) => {
            const { timestamp, level, message } = info;
            const str = `[filename: ${name}]${padding}`.substring(
                0,
                padding.length
            );
            let out = '';
            if (info[SPLAT]) {
                out = info[SPLAT].map((e) => {
                    if (e && e.error) {
                        if (e.error.stack) {
                            return e.error.stack;
                        }
                        return e.error.message;
                    }
                    return safeStringify(e);
                });
            }
            return `${timestamp} ${level} ${str} ${message} ${out} `;
        })
    );

const getLoggingLevel = () => {
    switch (process.env.ENVIRONMENT) {
        case 'development':
            return 'debug';
        case 'production':
            return 'info';
        default:
            return 'debug';
    }
};

// create a logger
// there is no hierarchy or split of loggers; one for future versions
function createLogger(logLevel, name) {
    const logger = winston.createLogger({
        level: logLevel,
        format: formatter(name),
        transports: [
            new winston.transports.Console({
                format: winston.format.combine(
                    winston.format.colorize(),
                    formatter(name)
                ),
                name: 'console',
                handleExceptions: true,
                level: getLoggingLevel(),
            }),
            new winston.transports.File({
                level: 'info',
                filename: `${appRoot}/logs/app.log`,
                handleExceptions: true,
                format: winston.format.json(),
                maxsize: 5242880, // 5MB
                maxFiles: 50,
            }),
        ],
        exitOnError: false,
    });

    logger.stream = {
        write(message) {
            // use the 'info' log level so the output will be picked up by
            // both transports(file and console)
            logger.info(message);
        },
    };
    return logger;
}

const levelMapping = (level) => {
    let logLevel = 'info';
    if (typeof level === 'string') {
        switch (level.toUpperCase()) {
            case 'CRITICAL':
                logLevel = 'fatal';
                break;
            case 'ERROR':
                logLevel = 'error';
                break;
            case 'WARNING':
                logLevel = 'warn';
                break;
            case 'DEBUG':
                logLevel = 'debug';
                break;
            case 'INFO':
                logLevel = 'info';
                break;
            default:
                logLevel = 'debug';
                break;
        }
    }
    return logLevel;
};

// Exported function to get the logger for a given name
module.exports.getLogger = (name = '') => {
    const logLevel = getLoggingLevel();

    let logger;
    if (loggers[name]) {
        logger = loggers[name];
        logger.level = logLevel;
    } else {
        logger = createLogger(logLevel, name);
        loggers[name] = logger;
    }

    return logger;
};

// This function is intended for once only use; it will setup a logger
// that will response to the unhandled Exceptions and the unhandledRejections
// Having too many transports that have handleExceptions = true results in
// node warnings about memory leaks.
function firstTime() {
    if (!loggers._) {
        const logLevel = levelMapping(process.env.LOGGING_LEVEL);
        loggers._ = winston.createLogger({
            level: logLevel,
            format: formatter('_'),
            transports: [
                new winston.transports.Console({
                    format: winston.format.combine(
                        winston.format.colorize(),
                        formatter('_')
                    ),
                    name: 'console',
                    handleExceptions: true,
                    level: getLoggingLevel(),
                }),
                new winston.transports.File({
                    level: 'info',
                    filename: `${appRoot}/logs/app.log`,
                    handleExceptions: true,
                    format: winston.format.json(),
                    maxsize: 5242880, // 5MB
                    maxFiles: 50,
                }),
            ],
            exitOnError: false,
        });
    }
}
firstTime();
