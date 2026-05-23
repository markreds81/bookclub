import { useState, useEffect, useRef } from 'react';
import { useBookStore } from '../store/bookStore';
import './SearchBooks.css';

export function SearchBooks() {
  const [query, setQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const sentinelRef = useRef(null);

  const {
    books, loading, loadingMore, error, searchBooks, searchHistory,
    favorites, toggleFavorite,
    suggestions, suggestionsLoading,
    hasMore, loadMoreBooks,
  } = useBookStore();

  const favoriteIds = new Set(favorites.map((f) => f.cover_id ?? f.title));

  const availableYears = [...new Set(
    books.map((b) => b.first_publish_year).filter(Boolean)
  )].sort((a, b) => a - b);

  const filteredBooks = selectedYear
    ? books.filter((b) => b.first_publish_year === Number(selectedYear))
    : books;

  const handleSearch = (q = query) => {
    const trimmed = q.trim();
    if (trimmed) {
      setQuery(trimmed);
      setSelectedYear('');
      setShowHistory(false);
      searchBooks(trimmed);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleSearch();
  };

  const handleHistoryClick = (item) => {
    handleSearch(item);
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMoreBooks(); },
      { threshold: 0.1 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loadMoreBooks]);

  return (
    <div className="sb-container">
      <h1 className="sb-title">📚 BookClub – Trova i tuoi libri</h1>

      <div className="sb-search-bar">
        <div className="sb-input-wrapper">
          <input
            type="text"
            className="sb-input"
            placeholder="Cerca un libro…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowHistory(true)}
            onBlur={() => setShowHistory(false)}
          />
          {showHistory && searchHistory.length > 0 && (
            <ul className="sb-history-dropdown">
              {searchHistory.map((item) => (
                <li
                  key={item}
                  className="sb-history-item"
                  onMouseDown={(e) => { e.preventDefault(); handleHistoryClick(item); }}
                >
                  <span className="sb-history-icon">🕐</span>
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
        <button className="sb-button" onClick={() => handleSearch()} disabled={loading}>
          Cerca
        </button>
      </div>

      {loading && <p className="sb-status">⏳ Caricamento...</p>}
      {!loading && error && <p className="sb-status sb-error">⚠ {error}</p>}
      {!loading && !error && books.length === 0 && (
        <p className="sb-status">Nessun libro trovato. Inizia a cercare!</p>
      )}

      {books.length > 0 && (
        <div className="sb-year-filter">
          <label className="sb-year-label" htmlFor="year-select">Filtra per anno</label>
          <select
            id="year-select"
            className="sb-year-select"
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
          >
            <option value="">Tutti gli anni</option>
            {availableYears.map((year) => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
      )}

      <div className="sb-layout">
        <div className="sb-main">
          {filteredBooks.length > 0 && (
            <div className="sb-grid">
              {filteredBooks.map((book) => {
                const id = book.cover_id ?? book.title;
                const isFav = favoriteIds.has(id);
                return (
                  <div className="sb-card" key={id}>
                    {book.cover_url && (
                      <img
                        className="sb-cover"
                        src={book.cover_url}
                        alt={`Copertina di ${book.title}`}
                      />
                    )}
                    <div className="sb-card-body">
                      <div className="sb-card-top">
                        <h2 className="sb-book-title">{book.title}</h2>
                        <button
                          className={`sb-fav-btn${isFav ? ' sb-fav-btn--active' : ''}`}
                          onClick={() => toggleFavorite(book)}
                          aria-label={isFav ? 'Rimuovi dai favoriti' : 'Aggiungi ai favoriti'}
                        >
                          {isFav ? '❤️' : '🤍'}
                        </button>
                      </div>
                      {book.author_name && <p className="sb-book-author">{book.author_name}</p>}
                      {book.first_publish_year && <p className="sb-book-year">{book.first_publish_year}</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && !error && books.length > 0 && filteredBooks.length === 0 && (
            <p className="sb-status">Nessun libro trovato per l'anno selezionato.</p>
          )}

          {loadingMore && <p className="sb-status sb-loading-more">⏳ Caricamento altri libri…</p>}
          {!loading && <div ref={sentinelRef} className="sb-sentinel" />}
        </div>

        {(suggestionsLoading || suggestions.length > 0) && (
          <aside className="sb-sidebar">
            <h2 className="sb-sidebar-title">Cerca anche</h2>
            {suggestionsLoading ? (
              <div className="sb-sidebar-loading">
                <span className="sb-sidebar-spinner" />
                <span>Generazione in corso…</span>
              </div>
            ) : (
              <ul className="sb-chips">
                {suggestions.map((s) => (
                  <li key={s}>
                    <button className="sb-chip" onClick={() => handleSearch(s)}>
                      {s}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        )}
      </div>
    </div>
  );
}
