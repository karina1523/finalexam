/**
 * MOCK BACKEND. Everything the app persists goes through `db` below.
 * Today it uses localStorage (per browser). To go multi-device, replace the
 * 5 methods with Supabase/Firebase calls; nothing else in the app changes.
 *
 * Supabase sketch:
 *   tests(id text pk, title text, questions jsonb, duration_sec int, created_at timestamptz)
 *   sessions(test_id text, user_id text, answers jsonb, ends_at bigint, submitted bool,
 *            score int, primary key (test_id, user_id))
 *   e.g. saveTest:    await supabase.from('tests').upsert(test)
 *        getSession:  (await supabase.from('sessions').select().eq('test_id',t).eq('user_id',u).maybeSingle()).data
 * Sessions are keyed by (testId, userId), so concurrent users never overwrite each other.
 */
const read = (k) => { try { return JSON.parse(localStorage.getItem(k) || 'null') } catch { return null } }
const write = (k, v) => localStorage.setItem(k, JSON.stringify(v))

export const db = {
  async saveTest(t) { write(`test:${t.id}`, t) },
  async getTest(id) { return read(`test:${id}`) },
  async saveSession(s) { write(`session:${s.testId}:${s.userId}`, s) },
  async getSession(testId, userId) { return read(`session:${testId}:${userId}`) },
  async listSessions(testId) {
    return Object.keys(localStorage).filter((k) => k.startsWith(`session:${testId}:`)).map(read)
  },
}

/** Anonymous per-browser identity. Replace with real auth (Supabase Auth, Firebase Auth) when ready. */
export function getUserId() {
  let id = localStorage.getItem('userId')
  if (!id) { id = crypto.randomUUID(); localStorage.setItem('userId', id) }
  return id
}
export const newId = () => crypto.randomUUID().slice(0, 8)
