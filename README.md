# 📚 BookClub

Progetto didattico sviluppato durante le lezioni frontali del **Master in AI Engineering** dell'Università [eCampus](https://www.uniecampus.it/).

Più che un'applicazione completa, è un **esercizio di stile** e un **playground** dove sperimentare l'integrazione di funzionalità AI all'interno di uno stack web moderno. L'esempio concreto è la sezione *Suggerimenti*, che usa un modello linguistico locale (via Ollama) per consigliare nuove ricerche in base alla cronologia dell'utente.

---

## Funzionalità

- **Ricerca libri** tramite le API pubbliche di [Open Library](https://openlibrary.org/developers/api)
- **Storico delle ricerche** con dropdown sotto la barra di ricerca (ultime 5 query)
- **Filtro per anno** di pubblicazione sui risultati
- **Preferiti** con persistenza su `localStorage`
- **Suggerimenti AI** generati da un LLM locale (Ollama) in base alla cronologia di ricerca

---

## Stack tecnologico

| Layer | Tecnologie |
|---|---|
| Frontend | React 19, Vite, Zustand |
| Backend | Node.js, Express 5 |
| AI | [Ollama](https://ollama.com/) (LLM locale) |
| Dati | Open Library REST API |

---

## Struttura del progetto

```
bookclub/
├── frontend/          # App React (Vite)
│   └── src/
│       ├── components/
│       │   ├── SearchBooks.jsx
│       │   └── SearchBooks.css
│       └── store/
│           └── bookStore.js   # Zustand store
└── api-backend/       # Server Express
    ├── server.js
    └── routes/
        ├── search.js          # Proxy Open Library
        └── suggestions.js     # Suggerimenti via Ollama
```

---

## Avvio in locale

### Prerequisiti

- Node.js 18+
- [Ollama](https://ollama.com/) installato e in esecuzione con almeno un modello (es. `llama3`, `mistral`)

### Backend

```bash
cd api-backend
npm install
node server.js
# → http://localhost:3001
```

Il modello Ollama usato per i suggerimenti è configurabile tramite variabile d'ambiente:

```bash
OLLAMA_MODEL=mistral node server.js
```

### Frontend

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
```

---

## API Backend

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/search?query=...` | Ricerca libri su Open Library |
| `POST` | `/api/suggestions` | Genera suggerimenti AI dalla cronologia |

Esempio richiesta suggerimenti:

```json
POST /api/suggestions
{ "history": ["cyberpunk", "storia romana"] }

// risposta
{ "success": true, "suggestions": ["fantascienza distopica", "impero romano", "ucronia"] }
```

---

*Esercizio svolto nell'ambito del Master in AI Engineering — Università eCampus.*
