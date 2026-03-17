import fs from 'fs'
import path from 'path'

type LogLevel = 'INFO' | 'WARN' | 'ERROR'

class Logger {
    private isFileSystemAvailable: boolean = true
    private logDir: string

    constructor() {
        this.logDir = path.join(process.cwd(), 'logs')
        // Only attempt to create log directory if NOT on Vercel
        if (process.env.VERCEL) {
            this.isFileSystemAvailable = false
        } else {
            try {
                if (!fs.existsSync(this.logDir)) {
                    fs.mkdirSync(this.logDir, { recursive: true })
                }
            } catch (err) {
                console.warn("Log directory creation failed, falling back to console only:", err)
                this.isFileSystemAvailable = false
            }
        }
    }

    private writeLog(level: LogLevel, context: string, message: string, meta?: any) {
        const timestamp = new Date().toISOString()
        const logString = `[${timestamp}] [${level}] [${context}] ${message} ${meta ? JSON.stringify(meta) : ''}\n`

        // Console output is always active and captured by Vercel Logs
        if (level === 'ERROR') {
            console.error('\x1b[31m%s\x1b[0m', logString) // Red
        } else if (level === 'WARN') {
            console.warn('\x1b[33m%s\x1b[0m', logString) // Yellow
        } else {
            console.log('\x1b[36m%s\x1b[0m', logString) // Cyan
        }

        // File output - only if available
        if (this.isFileSystemAvailable) {
            const logFile = path.join(this.logDir, `${new Date().toISOString().split('T')[0]}.log`)
            try {
                fs.appendFileSync(logFile, logString)
            } catch (err) {
                this.isFileSystemAvailable = false
                console.warn("Failed to write to log file, disabling FS logging:", err)
            }
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
