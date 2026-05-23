const { Router } = require('express');
const axios = require('axios');

const router = Router();

router.get('/', async (req, res) => {
  const { query } = req.query;

  console.log(`[GET /api/search] query="${query}"`);

  if (!query || query.trim() === '') {
    console.log('[GET /api/search] Errore: query vuota');
    return res.status(400).json({ success: false, error: 'Query non valida' });
  }

  try {
    console.log(`[GET /api/search] Chiamata Open Library con title="${query}"`);

    const response = await axios.get('https://openlibrary.org/search.json', {
      params: { title: query, limit: 10 },
      timeout: 5000,
    });

    console.log(`[GET /api/search] Open Library risposta: ${response.data.numFound} risultati totali`);

    const books = (response.data.docs || []).map((doc) => {
      const book = {
        title: doc.title,
        author_name: doc.author_name ? doc.author_name[0] : null,
        first_publish_year: doc.first_publish_year || null,
        cover_id: doc.cover_i || null,
      };

      if (book.cover_id) {
        book.cover_url = `https://covers.openlibrary.org/b/id/${book.cover_id}-M.jpg`;
      }

      return book;
    });

    console.log(`[GET /api/search] Restituiti ${books.length} libri`);

    return res.json({
      success: true,
      query,
      count: books.length,
      books,
    });
  } catch (err) {
    if (err.code === 'ECONNABORTED' || err.code === 'ERR_CANCELED') {
      console.log('[GET /api/search] Timeout: Open Library non ha risposto in 5 secondi');
      return res.status(504).json({ success: false, error: 'Timeout: Open Library non ha risposto in tempo' });
    }

    console.error('[GET /api/search] Errore:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;
