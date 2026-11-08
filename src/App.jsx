import { useCallback, useEffect, useState } from 'react'
import UploadForm from './components/UploadForm'
import Quiz from './components/Quiz'
import Results from './components/Results'
import { db, getUserId, newId } from './lib/storage'
import { generateTest, durationFor } from './lib/generate'

const userId = getUserId()
const routeId = () => (location.hash.match(/^#\/t\/([\w-]+)/) || [])[1] || null

export default function App() {
  const [testId, setTestId] = useState(routeId())
  const [test, setTest] = useState(null)
  const [session, setSession] = useState(null)
  const [others, setOthers] = useState(0)
  const [phase, setPhase] = useState('loading') // home | generating | intro | active | results | missing
  const [error, setError] = useState('')

  useEffect(() => {
    const onHash = () => setTestId(routeId())
    addEventListener('hashchange', onHash)
    return () => removeEventListener('hashchange', onHash)
  }, [])

  // Load the test and this user's own session whenever the link changes.
  useEffect(() => {
    if (!testId) { setPhase('home'); setTest(null); setSession(null); return }
    let cancelled = false
    ;(async () => {
      setPhase('loading')
      const t = await db.getTest(testId)
      if (cancelled) return
      if (!t) return setPhase('missing')
      const s = await db.getSession(testId, userId)
      setTest(t); setSession(s)
      setOthers((await db.listSessions(testId)).filter((x) => x.submitted && x.userId !== userId).length)
      setPhase(!s ? 'intro' : s.submitted ? 'results' : 'active')
    })()
    return () => { cancelled = true }
  }, [testId])

  const create = async (text) => {
    setError(''); setPhase('generating')
    try {
      const { title, questions } = await generateTest(text)
      const t = { id: newId(), title, questions, durationSec: durationFor(questions.length), createdAt: Date.now() }
      await db.saveTest(t)
      location.hash = `#/t/${t.id}`
    } catch (e) { setError(e.message || 'Something went wrong.'); setPhase('home') }
  }

  const start = async () => {
    const s = { testId, userId, answers: {}, endsAt: Date.now() + test.durationSec * 1000, submitted: false, score: 0 }
    await db.saveSession(s); setSession(s); setPhase('active')
  }

  const answer = async (qi, k) => {
    const s = { ...session, answers: { ...session.answers, [qi]: k } }
    setSession(s); await db.saveSession(s)
  }

  const submit = useCallback(async () => {
    setSession((cur) => {
      if (!cur || cur.submitted) return cur
      const score = test.questions.reduce((n, q, i) => n + (cur.answers[i] === q.answer ? 1 : 0), 0)
      const s = { ...cur, submitted: true, score }
      db.saveSession(s)
      setPhase('results')
      return s
    })
  }, [test])

  const home = () => { location.hash = ''; setError('') }

  return (
    <div className="mx-auto min-h-screen max-w-3xl px-4 py-8">
      <header className="mb-8 flex items-center justify-between">
        <button onClick={home} className="font-display text-xl font-bold text-pine">QuizForge</button>
        {test && (phase === 'active' || phase === 'results') && <span className="max-w-[55%] truncate text-sm text-ink/60">{test.title}</span>}
      </header>

      {phase === 'loading' && <p className="text-ink/60">Загрузка…</p>}
      {phase === 'missing' && (
        <div className="rise space-y-4"><p>Этот тест не найден в вашем браузере.</p><button className="btn-primary" onClick={home}>Создать тест</button></div>
      )}
      {(phase === 'home' || phase === 'generating') && <UploadForm onSubmit={create} loading={phase === 'generating'} error={error} />}
      {phase === 'intro' && test && (
        <div className="rise space-y-6 rounded-2xl border border-ink/10 bg-white p-8 shadow-sm">
          <h1 className="font-display text-3xl font-bold">Тест готов</h1>
          <ul className="space-y-2 text-ink/75">
            <li>Вопросов: <b className="text-ink">{test.questions.length}</b></li>
            <li>Время: <b className="text-ink">{Math.round(test.durationSec / 60)} мин</b></li>
            <li>После выбора ответа правильный вариант показывается сразу.</li>
            <li>Таймер запускается кнопкой «Начать» и не останавливается при обновлении страницы.</li>
          </ul>
          <div className="flex gap-3">
            <button className="btn-primary" onClick={start}>Начать тест</button>
            <button className="btn-ghost" onClick={home}>Назад</button>
          </div>
        </div>
      )}
      {phase === 'active' && test && session && <Quiz test={test} session={session} onAnswer={answer} onSubmit={submit} />}
      {phase === 'results' && test && session && <Results test={test} session={session} onNew={home} />}
    </div>
  )
}
