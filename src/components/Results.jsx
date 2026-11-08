import { useState } from 'react'

const L = 'АБВГДЕЖЗ'

export default function Results({ test, session, onNew }) {
  const [onlyWrong, setOnlyWrong] = useState(false)
  const total = test.questions.length
  const pct = Math.round((session.score / total) * 100)
  const rows = test.questions.map((q, i) => ({ q, i, mine: session.answers[i] })).filter((r) => !onlyWrong || r.mine !== r.q.answer)

  return (
    <div className="rise space-y-6">
      <div className="rounded-2xl bg-ink p-8 text-white">
        <p className="text-white/70">Ваш результат</p>
        <p className="font-display text-6xl font-bold">{session.score}<span className="text-3xl text-white/60"> из {total}</span></p>
        <p className="mt-1 text-amber">{pct}% правильных ответов</p>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button className="btn-ghost !py-1.5 text-sm" onClick={() => setOnlyWrong(!onlyWrong)}>{onlyWrong ? 'Показать все' : 'Показать только ошибки'}</button>
        <button className="btn-primary" onClick={onNew}>Создать новый тест</button>
      </div>
      {!rows.length && <p className="rounded-xl bg-pine/10 p-4 font-semibold text-pineDark">Ошибок нет, отличный результат!</p>}
      <ol className="space-y-4">
        {rows.map(({ q, i, mine }) => {
          const ok = mine === q.answer
          return (
            <li key={i} className={`rounded-xl border bg-white p-5 ${ok ? 'border-pine/40' : 'border-red-300'}`}>
              <p className="whitespace-pre-line font-semibold">{i + 1}. {q.q}</p>
              <p className="mt-3 text-sm">Ваш ответ: <b className={ok ? 'text-pine' : 'text-red-700'}>{mine == null ? 'нет ответа' : `${L[mine]}) ${q.options[mine]}`}</b></p>
              {!ok && <p className="text-sm">Правильный ответ: <b className="text-pine">{L[q.answer]}) {q.options[q.answer]}</b></p>}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
