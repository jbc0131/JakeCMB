import { useState } from 'react'
import NotesInput from './components/NotesInput'
import Flashcards from './components/Flashcards'
import Quiz from './components/Quiz'
import { generateStudySet } from './lib/api'
import styles from './App.module.css'

const TABS = ['Notes', 'Flashcards', 'Quiz']

export default function App() {
  const [tab, setTab] = useState('Notes')
  const [flashcards, setFlashcards] = useState([])
  const [questions, setQuestions] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleGenerate({ notes, numCards, numQuestions }) {
    setLoading(true)
    setError('')
    try {
      const result = await generateStudySet({ notes, numCards, numQuestions })
      setFlashcards(result.flashcards)
      setQuestions(result.questions)
      setTab('Flashcards')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.layout}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}>⬡</span>
            <span className={styles.logoText}>CMB Study Tool</span>
          </div>
          <p className={styles.tagline}>Cellular &amp; Molecular Biology · AI-powered flashcards &amp; quizzes</p>
        </div>
      </header>

      <main className={styles.main}>
        <nav className={styles.tabs}>
          {TABS.map(t => (
            <button
              key={t}
              className={`${styles.tab} ${tab === t ? styles.tabActive : ''}`}
              onClick={() => setTab(t)}
            >
              {t}
              {t === 'Flashcards' && flashcards.length > 0 && (
                <span className={styles.tabCount}>{flashcards.length}</span>
              )}
              {t === 'Quiz' && questions.length > 0 && (
                <span className={styles.tabCount}>{questions.length}</span>
              )}
            </button>
          ))}
        </nav>

        {error && (
          <div className={styles.errorBanner}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <div className={styles.content}>
          {tab === 'Notes' && (
            <NotesInput onGenerate={handleGenerate} loading={loading} />
          )}
          {tab === 'Flashcards' && (
            flashcards.length > 0
              ? <Flashcards cards={flashcards} />
              : <EmptyState message="Generate a study set from the Notes tab to see flashcards." onGo={() => setTab('Notes')} />
          )}
          {tab === 'Quiz' && (
            questions.length > 0
              ? <Quiz questions={questions} />
              : <EmptyState message="Generate a study set from the Notes tab to see quiz questions." onGo={() => setTab('Notes')} />
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        Built for CMB students · Powered by Claude
      </footer>
    </div>
  )
}

function EmptyState({ message, onGo }) {
  return (
    <div className={styles.emptyState}>
      <p>{message}</p>
      <button className={styles.emptyBtn} onClick={onGo}>Go to Notes →</button>
    </div>
  )
}
