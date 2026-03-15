import { useState, useRef } from 'react'
import { extractText } from '../lib/extractText'
import styles from './NotesInput.module.css'

export default function NotesInput({ onGenerate, loading }) {
  const [notes, setNotes] = useState('')
  const [fileName, setFileName] = useState('')
  const [fileLoading, setFileLoading] = useState(false)
  const [numCards, setNumCards] = useState('15')
  const [numQuestions, setNumQuestions] = useState('10')
  const fileRef = useRef()

  async function handleFile(e) {
    const file = e.target.files[0]
    if (!file) return
    setFileLoading(true)
    setFileName(file.name)
    try {
      const { text, pages } = await extractText(file)
      setNotes(text)
      setFileName(`${file.name} (${pages} page${pages !== 1 ? 's' : ''} extracted)`)
    } catch (err) {
      setFileName('Error reading file: ' + err.message)
    } finally {
      setFileLoading(false)
    }
  }

  function handleSubmit() {
    if (!notes.trim()) return
    onGenerate({ notes, numCards: parseInt(numCards), numQuestions: parseInt(numQuestions) })
  }

  return (
    <div className={styles.container}>
      <div className={styles.uploadRow}>
        <button className={styles.uploadBtn} onClick={() => fileRef.current.click()} disabled={fileLoading}>
          {fileLoading ? 'Reading…' : '+ Upload PDF or TXT'}
        </button>
        <input ref={fileRef} type="file" accept=".pdf,.txt,.md,.docx" onChange={handleFile} style={{ display: 'none' }} />
        {fileName && <span className={styles.fileName}>{fileName}</span>}
      </div>

      <div className={styles.divider}><span>or paste your notes</span></div>

      <textarea
        className={styles.textarea}
        value={notes}
        onChange={e => setNotes(e.target.value)}
        placeholder="Paste lecture notes, textbook excerpts, or any CMB content here…"
        rows={12}
      />

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
          disabled={!notes.trim() || loading}
        >
          {loading ? (
            <span className={styles.spinner}>Generating<span className={styles.dots}></span></span>
          ) : 'Generate Study Set →'}
        </button>
      </div>
    </div>
  )
}
