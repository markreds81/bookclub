# 📚 BookClub

Progetto didattico sviluppato durante le lezioni frontali del **Master in AI Engineering** dell'Università [eCampus](https://www.uniecampus.it/).

Più che un'applicazione completa, è un **esercizio di stile** e un **playground** dove sperimentare l'integrazione di funzionalità AI all'interno di uno stack web moderno. L'esempio concreto è la sezione *Suggerimenti*, che usa un modello linguistico locale (via Ollama) per consigliare nuove ricerche in base alla cronologia dell'utente.

---

## Funzionalità

- **Ricerca libri** tramite le API pubbliche di [Open Library](https://openlibrary.org/developers/api)
- **Paginazione infinita** — i risultati vengono caricati 16 alla volta; scorrendo fino in fondo alla pagina il batch successivo viene recuperato automaticamente tramite `IntersectionObserver`
- **Storico delle ricerche** con dropdown sotto la barra di ricerca (ultime 5 query)
- **Filtro per anno** di pubblicazione sui risultati caricati
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

### Installazione dipendenze

Al primo avvio installa le dipendenze di tutti e tre i package:

```bash
npm install
npm install --prefix api-backend
npm install --prefix frontend
```

### Avvio (comando unico)

```bash
npm run dev
```

Avvia backend e frontend in parallelo. L'output è colorato e prefissato per distinguere i log dei due processi:

| Processo | URL |
|---|---|
| `backend` | http://localhost:3001 |
| `frontend` | http://localhost:5173 |

Per terminare entrambi: **Ctrl+C**

### Variabili d'ambiente

Il modello Ollama è configurabile tramite variabile d'ambiente (default: `llama3`):

```bash
OLLAMA_MODEL=mistral npm run dev
```

---

## Note tecniche

### Paginazione infinita con IntersectionObserver

Lo scroll infinito è implementato con la [Intersection Observer API](https://developer.mozilla.org/en-US/docs/Web/API/Intersection_Observer_API) nativa del browser, preferita a un semplice scroll listener per tre motivi:

- **Performance** — non scatta ad ogni evento scroll (decine al secondo), ma solo quando un elemento cambia stato di visibilità
- **Precisione** — il callback è legato a un elemento sentinel (`<div>` da 1px) posizionato sotto la griglia; quando entra nel viewport viene caricato il batch successivo
- **Standard moderno** — è l'approccio usato da Twitter, YouTube e altri feed infiniti

```
┌─────────────────────────┐
│  card  card  card  card │
│  card  card  card  card │  ← viewport
│  card  card  card  card │
├─────────────────────────┤
│  [sentinel — 1px]       │  ← IntersectionObserver lo osserva
└─────────────────────────┘
        ↓ entra nel viewport
   loadMoreBooks() chiamata
```

**Nota implementativa:** il sentinel deve essere sempre presente nel DOM (non condizionale). Se venisse montato/smontato in base allo stato di caricamento, l'observer si ricollegherebbe quando il ref è ancora `null`, mancando il trigger. Le dipendenze dell'`useEffect` (`hasMore`, `loadingMore`) garantiscono che l'observer venga ricreato al momento giusto, e con `threshold: 0` il callback scatta non appena un singolo pixel del sentinel diventa visibile.

---

## API Backend

| Metodo | Endpoint | Descrizione |
|---|---|---|
| `GET` | `/api/search?query=&limit=16&offset=0` | Ricerca libri su Open Library con paginazione |
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
