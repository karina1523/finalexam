/**
 * Тест строится ТОЛЬКО из того, что прислал пользователь. Ничего не генерируется, не переводится,
 * не перемешивается и не меняется: вопрос, варианты и порядок вариантов остаются как в исходнике.
 * 10 вопросов на входе = 10 вопросов в тесте.
 *
 * Формат (правильный ответ отмечен одним из способов):
 *   1. Текст вопроса
 *   А) вариант
 *   Б) вариант *        <- знак * или + или ✓ после (или перед) правильным вариантом
 *   В) вариант
 *   Ответ: Б            <- либо отдельная строка "Ответ: Б" / "Answer: B"
 * Для .docx правильным считается вариант, написанный жирным шрифтом (если жирный не весь список).
 */
const LETTERS = 'ABCDEFGH'
const CYR = { 'А': 0, 'Б': 1, 'В': 2, 'Г': 3, 'Д': 4, 'Е': 5 }
const letterIndex = (c) => { const u = c.toUpperCase(); return u in CYR ? CYR[u] : LETTERS.indexOf(u) }
const NUM = /^\s*\d+\s*[.)]\s+/
const LAB = /^\s*([*+✓✔]*)\s*\(?([A-FА-Еa-fа-е])\s*([*+✓✔]*)\s*[.)]\s*(.*)$/u

/** Вариант ответа: убирает отметки (* + ✓) в любом месте по краям, возвращает чистый текст и признак "правильный". */
function parseOpt(line) {
  const m = line.match(LAB)
  if (!m) return null
  let t = m[4].trim()
  let marked = !!(m[1] || m[3])
  for (let changed = true; changed;) {
    changed = false
    for (const re of [/^[*✓✔]+\s*/, /^\+\s+/, /\s*[*✓✔]+$/, /\s+\+$/]) {
      if (re.test(t)) { t = t.replace(re, '').trim(); marked = true; changed = true }
    }
  }
  return t ? { text: t, marked } : null
}
const ANS = /^\s*(?:правильный\s+)?(?:ответ|answer)\s*[:\-–]\s*\(?([A-FА-Еa-fа-е])/iu

function splitBlocks(text) {
  const lines = text.replace(/\r/g, '').split('\n')
  const numbered = lines.filter((l) => NUM.test(l)).length >= 2
  const blocks = []
  let cur = []
  let prevWasOption = false
  for (const l of lines) {
    const isOpt = parseOpt(l) || ANS.test(l)
    // новый вопрос: нумерация, пустая строка или обычная строка сразу после вариантов
    const startNew = numbered ? NUM.test(l) : !l.trim() || (!isOpt && prevWasOption)
    if (startNew && cur.length) { blocks.push(cur); cur = [] }
    if (l.trim()) { cur.push(l); prevWasOption = isOpt }
  }
  if (cur.length) blocks.push(cur)
  return blocks
}

export async function generateTest(text) {
  const blocks = splitBlocks(text)
  const questions = []
  const broken = []
  blocks.forEach((lines, n) => {
    const qLines = []; const options = []; const marked = []; let answer = -1
    for (const l of lines) {
      const a = l.match(ANS)
      if (a) { answer = letterIndex(a[1]); continue }
      const o = parseOpt(l)
      if (o && (options.length || qLines.length)) {
        if (o.marked) marked.push(options.length)
        options.push(o.text)
      } else if (options.length) options[options.length - 1] += ' ' + l.trim()
      else qLines.push(l.replace(NUM, '').trim())
    }
    if (options.length < 2) return // не вопрос (заголовок и т.п.)
    if (answer < 0 && marked.length === 1) answer = marked[0]
    if (answer < 0 || answer >= options.length) { broken.push(questions.length + broken.length + 1); return }
    questions.push({ q: qLines.join(' '), options, answer, explanation: '' })
  })
  if (broken.length) {
    throw new Error(`Не найден (или найден не один) правильный ответ в вопросах №: ${broken.slice(0, 20).join(', ')}. Отметьте его знаком * после варианта или строкой «Ответ: Б».`)
  }
  if (!questions.length) {
    throw new Error('Не найдено ни одного вопроса с вариантами ответов. Нужен формат: вопрос, затем варианты А) Б) В) Г) и отметка правильного.')
  }
  return { title: questions[0].q.slice(0, 40), questions }
}

/** Время: ~45 сек на вопрос, минимум 5 минут, максимум 3 часа. */
export const durationFor = (n) => Math.min(10800, Math.max(300, n * 45))
