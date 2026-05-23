const express = require('express');
const cors = require('cors');
const searchRouter = require('./routes/search');
const suggestionsRouter = require('./routes/suggestions');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/search', searchRouter);
app.use('/api/suggestions', suggestionsRouter);

app.listen(PORT, () => {
  console.log(`Server in ascolto su http://localhost:${PORT}`);
});
