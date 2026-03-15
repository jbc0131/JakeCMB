import { useState, useEffect, useRef } from 'react'
import { logger } from '../lib/logger'
import styles from './DebugPanel.module.css'

export default function DebugPanel() {
  const [entries, setEntries] = useState([])
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const bottomRef = useRef()

  useEffect(() => {
    return logger.subscribe(setEntries)
  }, [])

  useEffect(() => {
    if (open && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [entries, open])

  async function handleCopy() {
    try {
      await logger.copyToClipboard()
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      // fallback: select the textarea
    }
  }

  const errorCount = entries.filter(e => e.level === 'error').length
  const hasEntries = entries.length > 0

  return (
    <div className={styles.panel}>
      <button
        className={`${styles.toggle} ${errorCount > 0 ? styles.toggleError : ''}`}
        onClick={() => setOpen(o => !o)}
      >
        <span className={styles.toggleIcon}>{open ? '▾' : '▸'}</span>
        Debug log
        {hasEntries && (
          <span className={`${styles.badge} ${errorCount > 0 ? styles.badgeError : styles.badgeInfo}`}>
            {errorCount > 0 ? `${errorCount} error${errorCount > 1 ? 's' : ''}` : `${entries.length} events`}
          </span>
        )}
      </button>

      {open && (
        <div className={styles.body}>
          <div className={styles.toolbar}>
            <span className={styles.toolbarLabel}>{entries.length} log entries</span>
            <button className={styles.toolBtn} onClick={() => { logger.clear(); setEntries([]) }}>
              Clear
            </button>
            <button className={`${styles.toolBtn} ${copied ? styles.toolBtnCopied : ''}`} onClick={handleCopy}>
              {copied ? '✓ Copied!' : 'Copy all'}
            </button>
          </div>

          {entries.length === 0 ? (
            <p className={styles.empty}>No events yet. Upload a file or click Generate to start logging.</p>
          ) : (
            <div className={styles.logList}>
              {entries.map((e, i) => (
                <div key={i} className={`${styles.entry} ${styles[`entry_${e.level}`]}`}>
                  <span className={styles.ts}>{e.ts}</span>
                  <span className={styles.group}>[{e.group}]</span>
                  <span className={styles.msg}>{e.message}</span>
                  {e.data && (
                    <pre className={styles.data}>{e.data}</pre>
                  )}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
