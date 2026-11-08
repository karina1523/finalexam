import mammoth from 'mammoth'

const decode = (t) => t.replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&amp;/g, '&')
const OPTLINE = /^\s*\(?[A-FА-Еa-fа-е]\s*[.)]\s*\S/u

/** .docx -> текст по строкам; вариант, набранный целиком жирным, получает отметку * (правильный). */
async function docxToText(arrayBuffer) {
  const { value: html } = await mammoth.convertToHtml({ arrayBuffer })
  const lines = []
  for (const m of html.matchAll(/<(p|li)[^>]*>([\s\S]*?)<\/\1>/g)) {
    const inner = m[2]
    const plain = decode(inner.replace(/<br\s*\/?>/g, ' ').replace(/<[^>]+>/g, '')).trim()
    const boldAll = /<strong>/.test(inner) && inner.replace(/<strong>[\s\S]*?<\/strong>/g, '').replace(/<[^>]+>/g, '').trim() === ''
    lines.push(boldAll && OPTLINE.test(plain) ? plain + ' *' : plain)
  }
  return lines.join('\n')
}

const MAX_BYTES = 5 * 1024 * 1024

/** Returns plain text from a .txt or .docx File. Throws Error with a user-friendly message. */
export async function readFile(file) {
  const ext = file.name.split('.').pop().toLowerCase()
  if (!['txt', 'docx'].includes(ext)) throw new Error('Неподдерживаемый формат. Загрузите файл .txt или .docx.')
  if (file.size === 0) throw new Error('Файл пустой.')
  if (file.size > MAX_BYTES) throw new Error('Файл больше 5 МБ.')
  let text = ''
  try {
    text = ext === 'txt'
      ? await file.text()
      : await docxToText(await file.arrayBuffer())
  } catch {
    throw new Error('Не удалось прочитать файл. Возможно, он повреждён или защищён паролем.')
  }
  if (!text.trim()) throw new Error('В файле не найден текст.')
  return text
}
