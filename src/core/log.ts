export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const LEVEL_ORDER: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3 }
const ACTIVE: LogLevel = import.meta.env.DEV ? 'debug' : 'info'
const MAX_RING = 50
const ring: string[] = []

function stamp(level: LogLevel, message: string): string {
  const time = new Date().toISOString().slice(11, 23)
  return `[${time}][${level.toUpperCase()}] ${message}`
}

function write(level: LogLevel, message: string): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[ACTIVE]) return
  ring.push(stamp(level, message))
  if (ring.length > MAX_RING) ring.shift()
  const sink =
    level === 'error' ? console.error : level === 'warn' ? console.warn : level === 'debug' ? console.debug : console.info
  sink(stamp(level, message))
}

export const log = {
  debug: (m: string) => write('debug', m),
  info: (m: string) => write('info', m),
  warn: (m: string) => write('warn', m),
  error: (m: string) => write('error', m),
  lastErrors: (): string[] => ring.filter((line) => line.includes('[ERROR]')),
}

export function wireGlobalErrors(): void {
  if (typeof window === 'undefined') return
  window.addEventListener('error', (e) => log.error(`uncaught: ${e.message}`))
  window.addEventListener('unhandledrejection', (e) => {
    const reason = e.reason instanceof Error ? e.reason.message : String(e.reason)
    log.error(`unhandledRejection: ${reason}`)
  })
}
