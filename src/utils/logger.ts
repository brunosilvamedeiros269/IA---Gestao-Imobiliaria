import fs from 'fs'
import path from 'path'

type LogLevel = 'INFO' | 'WARN' | 'ERROR'

class Logger {
    private logDir: string

    constructor() {
        this.logDir = path.join(process.cwd(), 'logs')
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true })
        }
    }

    private writeLog(level: LogLevel, context: string, message: string, meta?: any) {
        const timestamp = new Date().toISOString()
        const logEntry = {
            timestamp,
            level,
            context,
            message,
            meta: meta || null
        }

        const logString = `[${timestamp}] [${level}] [${context}] ${message} ${meta ? JSON.stringify(meta) : ''}\n`

        // Console output
        if (level === 'ERROR') {
            console.error('\x1b[31m%s\x1b[0m', logString) // Red
        } else if (level === 'WARN') {
            console.warn('\x1b[33m%s\x1b[0m', logString) // Yellow
        } else {
            console.log('\x1b[36m%s\x1b[0m', logString) // Cyan
        }

        // File output
        const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`)

        try {
            fs.appendFileSync(logFile, logString)
        } catch (err) {
            console.error("Failed to write to log file:", err)
        }
    }

    info(context: string, message: string, meta?: any) {
        this.writeLog('INFO', context, message, meta)
    }

    warn(context: string, message: string, meta?: any) {
        this.writeLog('WARN', context, message, meta)
    }

    error(context: string, message: string, meta?: any) {
        this.writeLog('ERROR', context, message, meta)
    }
}

export const logger = new Logger()
