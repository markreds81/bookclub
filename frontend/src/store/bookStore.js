import { create } from 'zustand';
import axios from 'axios';

const FAVORITES_KEY = 'bookclub_favorites';

const bookId = (book) => book.cover_id ?? book.title;

const loadFavorites = () => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveFavorites = (favorites) => {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
};

const PAGE_SIZE = 16;

export const useBookStore = create((set, get) => ({
  books: [],
  loading: false,
  loadingMore: false,
  error: null,
  lastQuery: '',
  offset: 0,
  total: 0,
  hasMore: false,
  searchHistory: [],
  favorites: loadFavorites(),
  suggestions: [],
  suggestionsLoading: false,

  searchBooks: async (query) => {
    set((state) => ({
      loading: true,
      error: null,
      books: [],
      offset: 0,
      total: 0,
      hasMore: false,
      searchHistory: [query, ...state.searchHistory.filter((q) => q !== query)].slice(0, 5),
    }));
    try {
      const response = await axios.get('/api/search', {
        params: { query, limit: PAGE_SIZE, offset: 0 },
      });
      if (response.data.success) {
        const { books, total } = response.data;
        set({
          books,
          lastQuery: query,
          offset: books.length,
          total,
          hasMore: books.length < total,
        });
        get().fetchSuggestions();
      } else {
        set({ error: response.data.error || 'Ricerca fallita' });
      }
    } catch (err) {
      set({ error: err.message || 'Errore di rete' });
    } finally {
      set({ loading: false });
    }
  },

  loadMoreBooks: async () => {
    const { lastQuery, offset, total, loadingMore, hasMore } = get();
    if (!hasMore || loadingMore) return;
    set({ loadingMore: true });
    try {
      const response = await axios.get('/api/search', {
        params: { query: lastQuery, limit: PAGE_SIZE, offset },
      });
      if (response.data.success) {
        const { books: newBooks } = response.data;
        set((state) => {
          const merged = [...state.books, ...newBooks];
          return { books: merged, offset: merged.length, total, hasMore: merged.length < total };
        });
      }
    } catch {
      // fallback silenzioso
    } finally {
      set({ loadingMore: false });
    }
  },

  fetchSuggestions: async () => {
    const { searchHistory } = get();
    set({ suggestionsLoading: true });
    try {
      const response = await axios.post('/api/suggestions', { history: searchHistory });
      if (response.data.success) {
        set({ suggestions: response.data.suggestions });
      }
    } catch {
      // fallback silenzioso: la sidebar rimane vuota
    } finally {
      set({ suggestionsLoading: false });
    }
  },

  toggleFavorite: (book) =>
    set((state) => {
      const id = bookId(book);
      const exists = state.favorites.some((f) => bookId(f) === id);
      const next = exists
        ? state.favorites.filter((f) => bookId(f) !== id)
        : [...state.favorites, book];
      saveFavorites(next);
      return { favorites: next };
    }),

  clearResults: () => set({ books: [], error: null, lastQuery: '' }),
}));
