// Central debug log — stores entries in memory and notifies listeners
const entries = []
const listeners = new Set()

function notify() {
  listeners.forEach(fn => fn([...entries]))
}

export const logger = {
  subscribe(fn) {
    listeners.add(fn)
    fn([...entries])
    return () => listeners.delete(fn)
  },

  log(group, message, data) {
    const entry = {
      ts: new Date().toISOString().split('T')[1].replace('Z', ''),
      level: 'info',
      group,
      message,
      data: data !== undefined ? JSON.stringify(data, null, 2) : null,
    }
    entries.push(entry)
    console.log(`[${entry.ts}] [${group}] ${message}`, data ?? '')
    notify()
  },

  ok(group, message, data) {
    const entry = {
      ts: new Date().toISOString().split('T')[1].replace('Z', ''),
      level: 'ok',
      group,
      message,
      data: data !== undefined ? JSON.stringify(data, null, 2) : null,
    }
    entries.push(entry)
    console.log(`[${entry.ts}] ✓ [${group}] ${message}`, data ?? '')
    notify()
  },

  error(group, message, err) {
    const entry = {
      ts: new Date().toISOString().split('T')[1].replace('Z', ''),
      level: 'error',
      group,
      message,
      data: err ? (err.stack || err.message || JSON.stringify(err)) : null,
    }
    entries.push(entry)
    console.error(`[${entry.ts}] ✗ [${group}] ${message}`, err ?? '')
    notify()
  },

  clear() {
    entries.length = 0
    notify()
  },

  getAll() {
    return [...entries]
  },

  copyToClipboard() {
    const text = entries
      .map(e => `[${e.ts}] [${e.level.toUpperCase()}] [${e.group}] ${e.message}${e.data ? '\n' + e.data : ''}`)
      .join('\n')
    return navigator.clipboard.writeText(text).then(() => text)
  }
}
