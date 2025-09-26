// script.js

const asciiEl = document.getElementById('ascii');
const off = document.getElementById('offscreen');
const ctx = off.getContext('2d', { willReadFrequently: true });

const RAMP = "$@#%*+=-:. `'"; // ainda mantido para referência se quiser ajustes visuais
const frames = window.framesASCII || [];
let currentFrameIndex = 0;
const frameRate = 41.67; // ~24fps

function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

// ==========================
// Ajuste do canvas para o container (.ascii-wrapper)
// ==========================
function resizeCanvas() {
  const wrapper = document.querySelector('.ascii-wrapper');
  const rect = wrapper.getBoundingClientRect();

  off.width = Math.max(2, Math.floor(rect.width / 4));
  off.height = Math.max(2, Math.floor(rect.height / 6));

  asciiEl.style.width = rect.width + "px";
  asciiEl.style.height = rect.height + "px";
}

// ==========================
// Renderiza frame ASCII
// ==========================
function renderFrame(idx) {
  idx = clamp(idx, 0, frames.length - 1);
  resizeCanvas();

  const ascii = frames[idx] || frames[0] || 'Loading ASCII...';
  asciiEl.textContent = ascii;
}

function advanceFrame() {
  if (!frames.length) return;
  currentFrameIndex = (currentFrameIndex + 1) % frames.length;
  renderFrame(currentFrameIndex);
}

// ==========================
// Inicialização
// ==========================
window.addEventListener('DOMContentLoaded', () => {
  renderFrame(0);
  setInterval(advanceFrame, frameRate);

  // Redimensiona ao mudar o tamanho da janela
  window.addEventListener('resize', () => {
    renderFrame(currentFrameIndex);
  });

  // fade-in do header e conteúdo
  const header = document.querySelector('header.site-header');
  header.style.opacity = 0;
  header.style.transform = 'translateY(-20px)';
  header.style.animation = `fadeInUp 0.6s forwards`;
  header.style.animationDelay = '0.1s';

  const contentItems = document.querySelectorAll('.content-main > *');
  let delay = 0.3;

  contentItems.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.animation = `fadeInUp 0.6s forwards`;
    el.style.animationDelay = `${delay}s`;

    if (el.classList.contains('projects-index')) {
      const projects = el.querySelectorAll('.project-item');
      let pd = 0.2;
      projects.forEach(p => {
        p.style.opacity = 0;
        p.style.transform = 'translateY(20px)';
        p.style.animation = `fadeInUp 0.5s forwards`;
        p.style.animationDelay = `${delay + pd}s`;
        pd += 0.08;
      });
    }

    delay += 0.1;
  });
});

// ==========================
// Footer datetime
// ==========================
function updateDateTime() {
  const now = new Date();
  document.getElementById("datetime").textContent = now.toLocaleString();
}
setInterval(updateDateTime, 1000);
updateDateTime();