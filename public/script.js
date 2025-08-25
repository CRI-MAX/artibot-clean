document.addEventListener('DOMContentLoaded', () => {
  // 🌐 MENU HAMBURGER
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      menu.classList.toggle('active');
    });
  }

  // 🎨 FILTRI GALLERIA
  document.querySelectorAll('.filters button').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      filterProjects(category);
      mostraSuggerimento(category);
    });
  });

  // 🖼️ CARICAMENTO GALLERIA DINAMICA
  fetch('static/data/portfolio.json')
    .then(response => {
      if (!response.ok) throw new Error('Errore nel caricamento dei dati');
      return response.json();
    })
    .then(data => {
      const grid = document.querySelector('.grid');
      if (!grid) return;

      grid.innerHTML = '';

      data.forEach(item => {
        if (!item.image || !item.title || !item.description || !item.category) return;

        const div = document.createElement('div');
        div.className = `card ${item.category}`;
        div.dataset.category = item.category;
        div.innerHTML = `
          <img src="${item.image}" alt="${item.title}" onerror="this.src='static/images/fallback.jpg'">
          <h3>${item.title}</h3>
          <p>${item.description}</p>
        `;
        grid.appendChild(div);
      });

      // Attiva filtro "all" e suggerimento iniziale
      filterProjects('all');
      mostraSuggerimento('all');
    })
    .catch(error => {
      console.error('Errore:', error);
      const grid = document.querySelector('.grid');
      if (grid) {
        grid.innerHTML = '<p>Impossibile caricare i progetti al momento.</p>';
      }
    });

  // ⌨️ Invio con tasto Invio
  const input = document.getElementById('user-input');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // 📝 FORM NUOVA CREAZIONE
  const form = document.getElementById('aggiungi-creazione');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const nuovo = {
        title: form.title.value.trim(),
        description: form.description.value.trim(),
        category: form.category.value,
        image: form.image.value.trim()
      };

      const grid = document.querySelector('.grid');
      if (!grid) return;

      const div = document.createElement('div');
      div.className = `card ${nuovo.category}`;
      div.dataset.category = nuovo.category;
      div.innerHTML = `
        <img src="${nuovo.image}" alt="${nuovo.title}" onerror="this.src='static/images/fallback.jpg'">
        <h3>${nuovo.title}</h3>
        <p>${nuovo.description}</p>
      `;
      grid.appendChild(div);

      form.reset();
      filterProjects(nuovo.category);
      mostraSuggerimento(nuovo.category);
    });
  }
});

// 🎯 FILTRI
function filterProjects(category) {
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    card.style.display = (category === 'all' || card.dataset.category === category) ? 'block' : 'none';
  });
  mostraSuggerimento(category);
}

// 💡 SUGGERIMENTI CREATIVI
const ideeArtibot = {
  design: "🎨 Progetta un poster ispirato ai colori dell'autunno.",
  fotografia: "📸 Scatta un ritratto con luce naturale e sfondo urbano.",
  illustrazione: "🖌️ Disegna un animale immaginario nato da due specie reali.",
  all: "✨ Scegli una categoria per ricevere un'idea creativa!"
};

function mostraSuggerimento(categoria) {
  const box = document.getElementById('artibot-suggestion');
  if (box) box.textContent = ideeArtibot[categoria] || "Nessuna idea disponibile.";
}

// 🤖 CHATBOT ARTIBOT
function sendMessage() {
  const input = document.getElementById('user-input');
  const log = document.getElementById('chat-log');
  const userText = input.value.trim();
  if (!userText || !log) return;

  input.disabled = true;

  // Messaggio utente
  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.innerHTML = `<strong>Tu:</strong> ${userText}`;
  log.appendChild(userMsg);

  input.value = '';

  // Messaggio di caricamento
  const botMsg = document.createElement('div');
  botMsg.className = 'chat-message bot';
  botMsg.innerHTML = `<strong>Artibot:</strong> <em><span class="loader">💬</span> Sto pensando...</em>`;
  log.appendChild(botMsg);
  log.scrollTop = log.scrollHeight;

  // Timeout di sicurezza
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  fetch('/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message: userText }),
    signal: controller.signal
  })
    .then(res => res.json())
    .then(data => {
      const reply = data.reply || '⚠️ Nessuna risposta ricevuta.';
      botMsg.innerHTML = `<strong>Artibot:</strong> ${reply}`;
      log.scrollTop = log.scrollHeight;
    })
    .catch(err => {
      botMsg.innerHTML = `<strong>Artibot:</strong> 😓 Ops! Non riesco a rispondere al momento.`;
      console.error('Errore nella comunicazione con il server:', err);
    })
    .finally(() => {
      clearTimeout(timeout);
      input.disabled = false;
    });
}