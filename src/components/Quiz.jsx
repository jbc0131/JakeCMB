import { useState, useEffect } from 'react'
import styles from './Quiz.module.css'

function MCQuestion({ q, index, onAnswer }) {
  const [selected, setSelected] = useState(null)

  function pick(letter, i) {
    if (selected !== null) return
    setSelected(letter)
    onAnswer()
    // visual state handled locally
    void i
  }

  return (
    <div className={styles.qCard}>
      <span className={`${styles.badge} ${styles.badgeMC}`}>Multiple choice</span>
      <p className={styles.qText}>{index + 1}. {q.question}</p>
      <div className={styles.options}>
        {(q.options || []).map((opt, i) => {
          const letter = String.fromCharCode(65 + i)
          let cls = styles.option
          if (selected !== null) {
            if (letter === q.answer) cls += ' ' + styles.correct
            else if (letter === selected) cls += ' ' + styles.incorrect
          }
          return (
            <button key={i} className={cls} onClick={() => pick(letter, i)} disabled={selected !== null}>
              {opt}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function FBQuestion({ q, index, onAnswer }) {
  const [value, setValue] = useState('')
  const [revealed, setRevealed] = useState(false)

  function check() {
    if (revealed) return
    setRevealed(true)
    onAnswer()
  }

  return (
    <div className={styles.qCard}>
      <span className={`${styles.badge} ${styles.badgeFB}`}>Fill in the blank</span>
      <p className={styles.qText}>{index + 1}. {q.question}</p>
      <input
        className={styles.fbInput}
        value={value}
        onChange={e => setValue(e.target.value)}
        onKeyDown={e => e.key === 'Enter' && check()}
        placeholder="Type your answer…"
        disabled={revealed}
      />
      {!revealed && (
        <button className={styles.checkBtn} onClick={check}>Check answer</button>
      )}
      {revealed && (
        <div className={styles.reveal}>
          <span className={styles.revealLabel}>Answer:</span> {q.answer}
        </div>
      )}
    </div>
  )
}

function SAQuestion({ q, index, onAnswer }) {
  const [value, setValue] = useState('')
  const [revealed, setRevealed] = useState(false)

  function reveal() {
    if (revealed) return
    setRevealed(true)
    onAnswer()
  }

  return (
    <div className={styles.qCard}>
      <span className={`${styles.badge} ${styles.badgeSA}`}>Short answer</span>
      <p className={styles.qText}>{index + 1}. {q.question}</p>
      <textarea
        className={styles.saTextarea}
        value={value}
        onChange={e => setValue(e.target.value)}
        placeholder="Write your answer…"
        rows={3}
        disabled={revealed}
      />
      {!revealed && (
        <button className={styles.checkBtn} onClick={reveal}>Reveal sample answer</button>
      )}
      {revealed && (
        <div className={styles.reveal}>
          <span className={styles.revealLabel}>Sample answer:</span> {q.answer}
        </div>
      )}
    </div>
  )
}

export default function Quiz({ questions }) {
  const [answered, setAnswered] = useState(0)
  const [key, setKey] = useState(0)

  useEffect(() => {
    setAnswered(0)
    setKey(k => k + 1)
  }, [questions])

  if (!questions.length) return null

  function onAnswer() { setAnswered(a => a + 1) }
  const done = answered >= questions.length

  return (
    <div className={styles.container} key={key}>
      {questions.map((q, i) => {
        if (q.type === 'mc') return <MCQuestion key={i} q={q} index={i} onAnswer={onAnswer} />
        if (q.type === 'fb') return <FBQuestion key={i} q={q} index={i} onAnswer={onAnswer} />
        return <SAQuestion key={i} q={q} index={i} onAnswer={onAnswer} />
      })}

      {done && (
        <div className={styles.scoreCard}>
          <div className={styles.scoreNum}>{questions.length}/{questions.length}</div>
          <div className={styles.scoreLabel}>All questions completed</div>
          <button className={styles.retakeBtn} onClick={() => { setAnswered(0); setKey(k => k + 1) }}>
            Retake quiz
          </button>
        </div>
      )}
    </div>
  )
}
