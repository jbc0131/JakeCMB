import { useState, useRef } from 'react'
import { extractText } from '../lib/extractText'
import styles from './NotesInput.module.css'

export default function NotesInput({ onGenerate, loading }) {
  const [notes, setNotes] = useState('')
  const [fileStatus, setFileStatus] = useState(null) // { type: 'loading'|'ok'|'error', message: string }
  const [numCards, setNumCards] = useState('15')
  const [numQuestions, setNumQuestions] = useState('10')
  const fileRef = useRef()

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    // Reset input so same file can be re-uploaded
    e.target.value = ''
    setFileStatus({ type: 'loading', message: `Reading ${file.name}…` })
    setNotes('')
    try {
      const { text, pages } = await extractText(file)
      setNotes(text)
      setFileStatus({
        type: 'ok',
        message: `✓ ${file.name} — ${pages} page${pages !== 1 ? 's' : ''}, ${text.length.toLocaleString()} characters extracted`
      })
    } catch (err) {
      setFileStatus({ type: 'error', message: `✗ ${err.message}` })
    }
  }

  function handleSubmit() {
    if (!notes.trim() || loading) return
    onGenerate({ notes, numCards: parseInt(numCards), numQuestions: parseInt(numQuestions) })
  }

  const canGenerate = notes.trim().length > 0 && !loading

  return (
    <div className={styles.container}>
      <div className={styles.uploadRow}>
        <button
          className={styles.uploadBtn}
          onClick={() => fileRef.current.click()}
          disabled={fileStatus?.type === 'loading'}
        >
          {fileStatus?.type === 'loading' ? 'Reading…' : '+ Upload PDF or TXT'}
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf,.txt,.md"
          onChange={handleFile}
          style={{ display: 'none' }}
        />
      </div>

      {fileStatus && (
        <div className={`${styles.fileStatus} ${styles[`fileStatus_${fileStatus.type}`]}`}>
          {fileStatus.message}
        </div>
      )}

      <div className={styles.divider}><span>or paste your notes directly</span></div>

      <textarea
        className={styles.textarea}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Paste lecture notes, textbook excerpts, or any CMB content here…"
        rows={12}
      />

      {notes.trim().length > 0 && (
        <div className={styles.charCount}>
          {notes.trim().length.toLocaleString()} characters ready
        </div>
      )}

      <div className={styles.controls}>
        <select className={styles.select} value={numCards} onChange={e => setNumCards(e.target.value)}>
          <option value="8">8 flashcards</option>
          <option value="15">15 flashcards</option>
          <option value="25">25 flashcards</option>
        </select>
        <select className={styles.select} value={numQuestions} onChange={e => setNumQuestions(e.target.value)}>
          <option value="5">5 quiz questions</option>
          <option value="10">10 quiz questions</option>
          <option value="15">15 quiz questions</option>
        </select>
        <button
          className={styles.generateBtn}
          onClick={handleSubmit}
          disabled={!canGenerate}
          title={!notes.trim() ? 'Add notes above first' : ''}
        >
          {loading
            ? <span className={styles.spinner}>Generating<span className={styles.dots} /></span>
            : canGenerate
              ? 'Generate Study Set →'
              : 'Add notes above first'}
        </button>
      </div>
    </div>
  )
}
