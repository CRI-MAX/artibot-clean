require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENROUTER_API_KEY;

// Middleware
app.use(express.json());

// Serve cartelle statiche
app.use(express.static(path.join(__dirname, 'public'))); // HTML, CSS, JS
app.use('/static', express.static(path.join(__dirname, 'static'))); // Immagini, loghi, ecc.

// Endpoint per il chatbot
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;
  if (!userMessage) {
    return res.status(400).json({ reply: '❌ Messaggio mancante.' });
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'mistral/mistral-7b-instruct',
        messages: [
          { role: 'system', content: 'Sei Artibot, un assistente creativo e utile.' },
          { role: 'user', content: userMessage }
        ]
      })
    });

    const data = await response.json();
    console.log('📨 Risposta OpenRouter:', JSON.stringify(data, null, 2));

    const reply = data.choices?.[0]?.message?.content || '⚠️ Risposta non disponibile.';
    res.json({ reply });
  } catch (error) {
    console.error('🔥 Errore OpenRouter:', error);
    res.status(500).json({ reply: '⚠️ Errore interno del server.' });
  }
});

// Avvio server
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});