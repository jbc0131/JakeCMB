import { useState, useEffect } from 'react'
import styles from './Flashcards.module.css'

export default function Flashcards({ cards }) {
  const [deck, setDeck] = useState([])
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState(new Set())

  useEffect(() => {
    setDeck([...cards])
    setIndex(0)
    setFlipped(false)
    setKnown(new Set())
  }, [cards])

  if (!deck.length) return null
  const card = deck[index]

  function next() { setIndex(i => (i + 1) % deck.length); setFlipped(false) }
  function prev() { setIndex(i => (i - 1 + deck.length) % deck.length); setFlipped(false) }

  function toggleKnown() {
    setKnown(prev => {
      const next = new Set(prev)
      next.has(index) ? next.delete(index) : next.add(index)
      return next
    })
  }

  function shuffle() {
    const shuffled = [...deck].sort(() => Math.random() - 0.5)
    setDeck(shuffled)
    setIndex(0)
    setFlipped(false)
    setKnown(new Set())
  }

  function reset() {
    setDeck([...cards])
    setIndex(0)
    setFlipped(false)
    setKnown(new Set())
  }

  const isKnown = known.has(index)

  return (
    <div className={styles.container}>
      <div className={styles.topRow}>
        <span className={styles.progress}>
          {index + 1} <span className={styles.sep}>/</span> {deck.length}
          {known.size > 0 && <span className={styles.knownCount}> · {known.size} known</span>}
        </span>
        <div className={styles.actions}>
          <button className={styles.actionBtn} onClick={shuffle}>Shuffle</button>
          <button className={styles.actionBtn} onClick={reset}>Reset</button>
        </div>
      </div>

      <div
        className={`${styles.card} ${flipped ? styles.flipped : ''} ${isKnown ? styles.known : ''}`}
        onClick={() => setFlipped(f => !f)}
      >
        <div className={styles.cardInner}>
          <div className={styles.cardFront}>
            <span className={styles.sideLabel}>Term</span>
            <p className={styles.cardText}>{card.term}</p>
            <span className={styles.flipHint}>tap to flip</span>
          </div>
          <div className={styles.cardBack}>
            <span className={styles.sideLabel}>Definition</span>
            <p className={styles.cardText}>{card.definition}</p>
            <span className={styles.flipHint}>tap to flip back</span>
          </div>
        </div>
      </div>

      <div className={styles.navRow}>
        <button className={styles.navBtn} onClick={prev}>← Prev</button>
        <button
          className={`${styles.knownBtn} ${isKnown ? styles.knownActive : ''}`}
          onClick={toggleKnown}
        >
          {isKnown ? '✓ Known' : 'Mark known'}
        </button>
        <button className={styles.navBtn} onClick={next}>Next →</button>
      </div>

      <div className={styles.dots}>
        {deck.map((_, i) => (
          <button
            key={i}
            className={`${styles.dot} ${i === index ? styles.dotActive : ''} ${known.has(i) ? styles.dotKnown : ''}`}
            onClick={() => { setIndex(i); setFlipped(false) }}
          />
        ))}
      </div>
    </div>
  )
}
