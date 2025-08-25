require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.OPENROUTER_API_KEY;

// Middleware
app.use(express.json());

// Serve cartelle statiche
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Funzione per loggare le conversazioni
function logConversation(userMsg, botReply, req) {
  const timestamp = new Date().toISOString();
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const agent = req.headers['user-agent'];
  const entry = `[${timestamp}]\nIP: ${ip}\nUser-Agent: ${agent}\nUtente: ${userMsg}\nArtibot: ${botReply}\n\n`;
  fs.appendFile(path.join(__dirname, 'chatlog.txt'), entry, err => {
    if (err) console.error('Errore nel salvataggio log:', err);
  });
}

// Endpoint di test
app.get('/ping', (req, res) => {
  res.send('🏓 Pong! Il server è attivo.');
});

// Endpoint chatbot
app.post('/chat', async (req, res) => {
  const userMessage = req.body.message;

  if (!userMessage || typeof userMessage !== 'string' || userMessage.trim() === '') {
    return res.status(400).json({ reply: '❌ Messaggio non valido o vuoto.' });
  }

  if (!API_KEY) {
    console.error("❌ API_KEY mancante. Verifica le variabili d'ambiente.");
    return res.status(500).json({ reply: '🔒 Chiave API non configurata.' });
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

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`❌ Errore API (${response.status}):`, errorText);
      return res.status(response.status).json({ reply: `🚫 Errore ${response.status}: richiesta non riuscita.` });
    }

    const data = await response.json();
    console.log('📨 Risposta OpenRouter:', JSON.stringify(data, null, 2));

    const reply = data.choices?.[0]?.message?.content || '⚠️ Risposta non disponibile.';
    logConversation(userMessage, reply, req);
    res.json({ reply });

  } catch (error) {
    console.error('🔥 Errore OpenRouter:', error.response?.data || error.message || error);
    res.status(500).json({ reply: '😓 Ops! Errore interno. Riprova tra poco.' });
  }
});

// Avvio server
app.listen(PORT, () => {
  console.log(`🚀 Server listening on port ${PORT}`);
});