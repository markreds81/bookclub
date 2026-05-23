const { Router } = require('express');
const ollama = require('ollama').default;

const router = Router();

const FALLBACK = ['narrativa contemporanea', 'classici', 'gialli'];
const MODEL = process.env.OLLAMA_MODEL || 'llama3';

/**
 * Genera suggerimenti di ricerca basati sulla cronologia dell'utente.
 * @param {string[]} history - Ultime query di ricerca
 * @returns {Promise<string[]>} - Parole chiave suggerite
 */
async function generateBookSuggestions(history) {
  if (!history || history.length === 0) {
    return FALLBACK;
  }

  const prompt = `L'utente ha cercato recentemente questi argomenti o titoli di libri: ${JSON.stringify(history)}.
In base a questi interessi, genera 3 nuove parole chiave o generi letterari correlati che potrebbero piacergli, utili da cercare su un motore di ricerca di libri.

Rispondi ESCLUSIVAMENTE con un oggetto JSON valido, senza introduzioni o spiegazioni.
Formato richiesto:
{
  "suggestions": ["parola chiave 1", "parola chiave 2", "parola chiave 3"]
}`;

  const response = await ollama.generate({
    model: MODEL,
    prompt,
    format: 'json',
    options: { temperature: 0.7 },
  });

  const data = JSON.parse(response.response);
  if (!Array.isArray(data.suggestions) || data.suggestions.length === 0) {
    throw new Error('Risposta AI non valida');
  }
  return data.suggestions;
}

router.post('/', async (req, res) => {
  const { history } = req.body;

  console.log(`[POST /api/suggestions] history=${JSON.stringify(history)}`);

  if (!Array.isArray(history)) {
    return res.status(400).json({ success: false, error: 'Il campo "history" deve essere un array' });
  }

  try {
    const suggestions = await generateBookSuggestions(history);
    console.log(`[POST /api/suggestions] Suggerimenti generati: ${JSON.stringify(suggestions)}`);
    return res.json({ success: true, suggestions });
  } catch (err) {
    console.error('[POST /api/suggestions] Errore Ollama:', err.message);
    return res.json({ success: true, suggestions: FALLBACK, fallback: true });
  }
});

module.exports = router;
