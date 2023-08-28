const express = require('express');
const fs = require('fs');
const math = require('mathjs');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const HISTORY_FILE = 'history.json';
let history = [];

// Load history from the file on server start
try {
  const historyData = fs.readFileSync(HISTORY_FILE, 'utf8');
  history = JSON.parse(historyData);
} catch (error) {
  console.error('Error loading history:', error);
}

app.get('/', (req, res) => {
  const htmlResponse = `
    <h1>Math Expression Evaluator</h1>
    <p>Enter a mathematical expression in the URL like: /calculate/</p>
    <h2>History</h2>
    <ul>
      ${history.map(entry => `<li>${entry.expression} = ${entry.answer}</li>`).join('')}
    </ul>`;
    
  res.send(htmlResponse);
});

app.get('/calculate/:expression', (req, res) => {
  const { expression } = req.params;

  if (!expression) {
    res.status(400).json({ error: 'Expression parameter is missing.' });
    return;
  }

  try {
    const result = math.evaluate(expression);
    const entry = { expression, answer: result };
    history.unshift(entry);
    if (history.length > 20) {
      history.pop();
    }

    // Save history to the file
    fs.writeFileSync(HISTORY_FILE, JSON.stringify(history), 'utf8');

    res.redirect('/');
  } catch (error) {
    res.status(400).json({ error: 'Invalid expression.' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
