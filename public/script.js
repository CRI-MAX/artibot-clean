document.addEventListener('DOMContentLoaded', () => {
  // 🌐 MENU HAMBURGER
  const hamburger = document.querySelector('.hamburger');
  const menu = document.querySelector('.menu');
  if (hamburger && menu) {
    hamburger.addEventListener('click', () => {
      const isActive = menu.classList.toggle('active');
      menu.hidden = !isActive;
      hamburger.setAttribute('aria-expanded', isActive);
    });
  }

  // 🎨 FILTRI GALLERIA
  document.querySelectorAll('.filters button').forEach(button => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      document.querySelectorAll('.filters button').forEach(btn => btn.classList.remove('active'));
      button.classList.add('active');
      filterProjects(category);
      mostraSuggerimento(category);
    });
  });

  // 🖼️ CARICAMENTO GALLERIA DINAMICA
  caricaGalleria();

  // ⌨️ Invio con tasto Invio
  const input = document.getElementById('user-input');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') sendMessage();
    });
  }

  // 📱 Toggle sidebar su mobile
  document.getElementById('toggle-artibot')?.addEventListener('click', () => {
    const sidebar = document.getElementById('artibot-sidebar');
    sidebar?.classList.toggle('active');
  });

  // 🎤 Saluto vocale al caricamento
  const frase = "Ciao! Sono Artibot, il tuo assistente creativo.";
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(frase);
    utterance.lang = 'it-IT';
    speechSynthesis.speak(utterance);
  }
});

// 🎯 FILTRI
function filterProjects(category) {
  document.querySelectorAll('.card').forEach(card => {
    card.style.display = (category === 'all' || card.dataset.category === category) ? 'block' : 'none';
  });
}

// 💡 SUGGERIMENTI CREATIVI
const ideeArtibot = {
  pittura: "🎨 Prova a dipingere un paesaggio con colori tenui e rilassanti.",
  collage: "✂️ Crea un collage con materiali riciclati e forme geometriche.",
  legno: "🪵 Costruisci una cornice decorata con incisioni personalizzate.",
  all: "✨ Scegli una categoria per ricevere un'idea creativa!"
};

function mostraSuggerimento(categoria) {
  const box = document.getElementById('artibot-suggestion');
  if (box) box.textContent = ideeArtibot[categoria] || "Nessuna idea disponibile.";
}

// 🖼️ GALLERIA DINAMICA
async function caricaGalleria() {
  try {
    const res = await fetch('static/data/portfolio.json');
    if (!res.ok) throw new Error('Errore nel caricamento dei dati');
    const data = await res.json();
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

    filterProjects('all');
    mostraSuggerimento('all');
  } catch (error) {
    console.error('Errore:', error);
    const grid = document.querySelector('.grid');
    if (grid) {
      grid.innerHTML = '<p>Impossibile caricare i progetti al momento.</p>';
    }
  }
}

// 🤖 CHATBOT ARTIBOT
function sendMessage() {
  const input = document.getElementById('user-input');
  const log = document.getElementById('chat-log');
  const userText = input.value.trim();
  if (!userText || !log) return;

  input.disabled = true;

  const userMsg = document.createElement('div');
  userMsg.className = 'chat-message user';
  userMsg.innerHTML = `<strong>Tu:</strong> ${userText}`;
  log.appendChild(userMsg);

  input.value = '';

  const botMsg = document.createElement('div');
  botMsg.className = 'chat-message bot';
  botMsg.innerHTML = `<strong>Artibot:</strong> <em><span class="loader">💬</span> Sto pensando...</em>`;
  log.appendChild(botMsg);
  log.scrollTop = log.scrollHeight;

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