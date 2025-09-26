// script.js
import { frames } from './frames.js'; // importar frames já em ASCII

const asciiEl = document.getElementById('ascii');
const off = document.getElementById('offscreen');
const ctx = off.getContext('2d'); // ainda mantido se quiser futuras manipulações

let currentFrameIndex = 0;
const totalFrames = frames.length;
let frameRate = 41.67; // ~24fps

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
// Renderização do frame atual
// ==========================
function renderFrame(idx){
  idx = Math.min(Math.max(idx, 0), frames.length - 1);

  resizeCanvas();

  const ascii = frames[idx];
  if(ascii !== null) asciiEl.textContent = ascii;
}

function advanceFrame(){
  if (!frames.length) return;
  currentFrameIndex = (currentFrameIndex+1) % frames.length;
  renderFrame(currentFrameIndex);
}

// ==========================
// Inicialização da animação
// ==========================
renderFrame(0);
setInterval(advanceFrame, frameRate);

// Redimensiona ao mudar o tamanho da janela
window.addEventListener('resize', ()=>{
  renderFrame(currentFrameIndex);
});

// ==========================
// fade-in do header e do conteúdo
// ==========================
window.addEventListener('DOMContentLoaded', () => {
  const header = document.querySelector('header.site-header');
  header.classList.add('fade-in-up');
  header.style.animationDelay = '0.1s';

  const contentItems = document.querySelectorAll('.content-main > *');
  let delay = 0.3; // conteúdo começa após header

  contentItems.forEach((el, i) => {
    el.classList.add('fade-in-up');
    el.style.animationDelay = `${delay}s`;

    if(el.classList.contains('projects-index')){
      const projects = el.querySelectorAll('.project-item');
      let pd = 0.2;
      projects.forEach(p=>{
        p.classList.add('fade-in-up');
        p.style.animationDelay = `${delay+pd}s`;
        pd += 0.08;
      });
    }

    delay += 0.1;
  });
});

// ==========================
// Footer datetime
// ==========================
function updateDateTime(){
  const now = new Date();
  document.getElementById("datetime").textContent = now.toLocaleString();
}
setInterval(updateDateTime,1000);
updateDateTime();