# QuizForge

Paste notes or upload .docx/.txt, get a timed multiple-choice test with instant results.

## Run
    npm install
    npm run dev      # http://localhost:5173

Works immediately with the built-in offline generator (fill-in-the-blank questions).

## Формат
Тест строится только из ваших вопросов, без генерации, перевода и перемешивания. См. комментарий в `src/lib/generate.js`.

## Multi-user and storage
Each user gets an anonymous ID; sessions are keyed by (testId, userId), so simultaneous test-takers never overwrite each other. Share links look like `/#/t/<testId>`.
Storage is localStorage in `src/lib/storage.js`, so links only work in the same browser until you swap those 5 methods for Supabase/Firebase (schema sketch inside the file). Also replace `getUserId()` with real auth if needed.
