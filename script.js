const asciiEl = document.getElementById('ascii');
const off = document.getElementById('offscreen');
const ctx = off.getContext('2d');

const RAMP = "$@#%*+=-:. `'";
let frames = [];
let currentFrameIndex = 0;
const totalFrames = 991;
let frameRate = 41.67; // ~24fps

const SETTINGS = { gamma: 0.9, contrast: 1.2, brightness: 0 };

function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

// ==========================
// Ajuste do canvas para o container (.ascii-wrapper)
// ==========================
function resizeCanvas() {
  const wrapper = document.querySelector('.ascii-wrapper');
  const rect = wrapper.getBoundingClientRect();

  // Ajusta o canvas para a largura e altura real do wrapper
  off.width = Math.max(2, Math.floor(rect.width / 4));
  off.height = Math.max(2, Math.floor(rect.height / 6));

  // Ajusta o <pre> para ocupar o espaço do wrapper
  asciiEl.style.width = rect.width + "px";
  asciiEl.style.height = rect.height + "px";
}

// ==========================
// Funções de processamento de ASCII
// ==========================
function adjustLuminance(v) {
  let n = v / 255;
  if (SETTINGS.gamma !== 1.0 && SETTINGS.gamma > 0) n = Math.pow(n, SETTINGS.gamma);
  let value = n * 255;
  value = (value - 128) * SETTINGS.contrast + 128 + SETTINGS.brightness;
  return clamp(Math.round(value), 0, 255);
}

function imageToASCII(img){
  if(!img || !img.complete) return null;

  ctx.clearRect(0,0,off.width,off.height);
  ctx.drawImage(img, 0, 0, off.width, off.height);

  const raw = ctx.getImageData(0,0,off.width,off.height).data;
  let out = "";
  for (let y = 0; y < off.height; y++) {
    for (let x = 0; x < off.width; x++) {
      const i = (y * off.width + x) * 4;
      const lum = 0.299*raw[i] + 0.587*raw[i+1] + 0.114*raw[i+2];
      const v = adjustLuminance(lum);
      const ci = Math.floor((v / 255) * (RAMP.length-1));
      out += RAMP[ci];
    }
    out += "\n";
  }
  return out;
}

function renderFrame(idx){
  idx = clamp(idx,0,frames.length-1);

  // Atualiza tamanho do canvas antes de renderizar
  resizeCanvas();

  const ascii = imageToASCII(frames[idx]);
  if(ascii !== null) asciiEl.textContent = ascii;
}

function advanceFrame(){
  if (!frames.length) return;
  currentFrameIndex = (currentFrameIndex+1) % frames.length;
  renderFrame(currentFrameIndex);
}

function preloadFrames(){
  for(let i=1;i<=totalFrames;i++){
    const img = new Image();
    img.src = `frames/frame_${String(i).padStart(3,'0')}.png`;
    frames.push(img);
  }
}

// ==========================
// Inicialização
// ==========================
preloadFrames();
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
  header.style.opacity = 0;
  header.style.transform = 'translateY(-20px)';
  header.style.animation = `fadeInUp 0.6s forwards`;
  header.style.animationDelay = '0.1s';

  const contentItems = document.querySelectorAll('.content-main > *');
  let delay = 0.3; // conteúdo começa após header

  contentItems.forEach(el => {
    el.style.opacity = 0;
    el.style.transform = 'translateY(20px)';
    el.style.animation = `fadeInUp 0.6s forwards`;
    el.style.animationDelay = `${delay}s`;

    if(el.classList.contains('projects-index')){
      const projects = el.querySelectorAll('.project-item');
      let pd = 0.2;
      projects.forEach(p=>{
        p.style.opacity = 0;
        p.style.transform = 'translateY(20px)';
        p.style.animation = `fadeInUp 0.5s forwards`;
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
