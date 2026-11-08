import { useState } from 'react'
import Timer from './Timer'

const L = 'АБВГДЕЖЗ'

export default function Quiz({ test, session, onAnswer, onSubmit }) {
  const total = test.questions.length
  // продолжаем с первого вопроса без ответа
  const [i, setI] = useState(() => Math.max(0, test.questions.findIndex((_, k) => session.answers[k] == null)))
  const q = test.questions[i]
  const picked = session.answers[i]
  const locked = picked != null // после выбора ответ фиксируется, правильный виден сразу
  const solved = Object.keys(session.answers).length
  const last = i === total - 1

  const finish = () => {
    const left = total - solved
    if (!left || window.confirm(`Вы не ответили на вопросов: ${left}. Завершить тест?`)) onSubmit()
  }

  return (
    <div className="rise space-y-6">
      <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-paper/95 px-4 py-3 backdrop-blur">
        <div className="flex items-center justify-between">
          <p className="font-semibold">Решено <span className="text-pine">{solved}</span> из {total}</p>
          <Timer endsAt={session.endsAt} onExpire={onSubmit} />
        </div>
        <div className="h-1.5 overflow-hidden rounded bg-ink/10">
          <div className="h-full bg-pine transition-all duration-300" style={{ width: `${(solved / total) * 100}%` }} />
        </div>
      </div>

      <div key={i} className="rise space-y-5 rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
        <h2 className="whitespace-pre-line text-xl font-semibold leading-snug">{q.q}</h2>
        <div role="radiogroup" className="space-y-2.5">
          {q.options.map((o, k) => {
            const on = picked === k
            const right = k === q.answer
            const cls = locked
              ? right ? 'border-pine bg-pine/10' : on ? 'border-red-500 bg-red-50' : 'border-ink/10 opacity-60'
              : 'border-ink/15 hover:border-pine/60 hover:bg-paper'
            const badge = locked && right ? 'bg-pine text-white' : locked && on ? 'bg-red-600 text-white' : 'bg-ink/10'
            return (
              <button key={k} role="radio" aria-checked={on} disabled={locked} onClick={() => onAnswer(i, k)}
                className={`flex w-full items-center gap-3 rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-pine ${cls}`}>
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${badge}`}>{L[k]}</span>
                <span>{o}</span>
              </button>
            )
          })}
        </div>
        {locked && (
          <p className={`rise rounded-xl p-4 text-sm font-semibold ${picked === q.answer ? 'bg-pine/10 text-pineDark' : 'bg-red-50 text-red-800'}`}>
            {picked === q.answer ? 'Верно!' : `Неверно. Правильный ответ: ${L[q.answer]}) ${q.options[q.answer]}`}
          </p>
        )}
      </div>

      <div className="flex justify-between">
        <button className="btn-ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Назад</button>
        {last
          ? <button className="btn-primary" onClick={finish}>Завершить тест</button>
          : <button className="btn-primary" onClick={() => setI(i + 1)}>Далее</button>}
      </div>
      {!last && solved > 0 && <button className="mx-auto block text-sm text-ink/50 underline hover:text-ink" onClick={finish}>Завершить досрочно</button>}
    </div>
  )
}
