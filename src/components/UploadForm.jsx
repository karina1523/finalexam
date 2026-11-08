import { useRef, useState } from 'react'
import { readFile } from '../lib/parse'

const EXAMPLE = `1. Столица Франции?
А) Лион
Б) Париж *
В) Ницца
Г) Марсель

2. Сколько будет 2 + 2?
А) 3
Б) 4
В) 5
Ответ: Б`

export default function UploadForm({ onSubmit, loading, error }) {
  const [text, setText] = useState('')
  const [fileName, setFileName] = useState('')
  const [localError, setLocalError] = useState('')
  const input = useRef()

  const handleFile = async (file) => {
    if (!file) return
    setLocalError('')
    try { setText(await readFile(file)); setFileName(file.name) }
    catch (e) { setLocalError(e.message); setFileName(''); input.current.value = '' }
  }

  return (
    <div className="rise space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold leading-tight sm:text-5xl">Ваши вопросы — ваш тест</h1>
        <p className="mt-3 max-w-xl text-ink/70">Отправьте вопросы с вариантами и ответами. Они остаются точно такими, как вы их написали: ничего не меняется и не добавляется.</p>
      </div>

      <section className="rounded-2xl border border-ink/10 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-bold">Как оформить вопросы</h2>
        <div className="grid gap-6 sm:grid-cols-2">
          <pre className="overflow-x-auto rounded-xl border-l-4 border-pine bg-paper p-4 text-sm leading-relaxed">{EXAMPLE}</pre>
          <ol className="space-y-2.5 text-sm text-ink/80">
            <li><b>1.</b> Номер и текст вопроса: <code>1. Вопрос?</code></li>
            <li><b>2.</b> Каждый вариант с новой строки: <code>А)</code> <code>Б)</code> <code>В)</code> <code>Г)</code> (можно и <code>A)</code> <code>B)</code> <code>C)</code> <code>D)</code>)</li>
            <li><b>3.</b> Правильный ответ: поставьте <code>*</code> после варианта <i>или</i> напишите строку <code>Ответ: Б</code></li>
            <li><b>4.</b> В файле Word правильный вариант можно выделить жирным</li>
            <li className="text-ink/60">Звёздочка в тесте не показывается. Между вопросами можно оставлять пустую строку.</li>
          </ol>
        </div>
        <button className="btn-ghost mt-5 !py-1.5 text-sm" onClick={() => { setText(EXAMPLE); setFileName('') }}>Вставить пример</button>
      </section>

      <div className="space-y-4">
        <textarea
          value={text} onChange={(e) => { setText(e.target.value); setFileName('') }} rows={12}
          placeholder="Вставьте сюда свои вопросы или загрузите файл…"
          className="w-full rounded-xl border border-ink/15 bg-white p-4 shadow-sm focus:border-pine focus:outline-none focus:ring-2 focus:ring-pine/30" />
        <div className="flex flex-wrap items-center gap-3">
          <input ref={input} type="file" accept=".txt,.docx" hidden onChange={(e) => handleFile(e.target.files[0])} />
          <button className="btn-ghost" onClick={() => input.current.click()} disabled={loading}>Загрузить .docx или .txt</button>
          {fileName && <span className="text-sm text-ink/60">Загружен файл: {fileName}</span>}
          <button className="btn-primary ml-auto" disabled={loading || !text.trim()} onClick={() => onSubmit(text)}>
            {loading ? 'Создаю тест…' : 'Создать тест'}
          </button>
        </div>
        {(localError || error) && (
          <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">{localError || error}</p>
        )}
      </div>
    </div>
  )
}
