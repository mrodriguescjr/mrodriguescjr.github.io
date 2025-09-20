/* script.js - Step 1: improved brightness mapping (gamma + contrast)
   Keep this file as the active script. To tweak behavior, change SETTINGS below.
*/

const asciiEl = document.getElementById('ascii');
const off = document.getElementById('offscreen');
const ctx = off.getContext('2d');

// Glyph ramp (keep as you had it)
const RAMP = "$@#%*+=-:. `'";

let frames = [];
let currentFrameIndex = 0;
const totalFrames = 720; // frame_001 to frame_720
let frameRate = 82; // ms per frame (you can tweak)

// === SETTINGS: tweak these to change the look ===
const SETTINGS = {
  gamma: 0.9,         // gamma correction: 1.0 = no change; <1 brightens, >1 darkens
  contrast: 1.2,     // contrast multiplier: 1.0 = no change; >1 increases contrast
  brightness: 0       // brightness offset in range roughly -50..+50
};
// =================================================

function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

// compute output size and font size for the <pre>
function computeOutputSize() {
  const margin = 20;
  const W = window.innerWidth - 2*margin;
  const H = window.innerHeight * 0.6;

  // keep previous resolution heuristics (change if you want finer/coarser)
  off.width = Math.max(2, Math.floor(W / 4));
  off.height = Math.max(2, Math.floor(H / 6));

  asciiEl.style.fontSize = "8px";
  asciiEl.style.lineHeight = "8px";

  const hero = document.getElementById('hero');
  if (hero) {
    hero.style.width = W + "px";
    hero.style.height = H + "px";
    hero.style.margin = margin + "px auto";
  }

  return {W,H};
}

/* Apply gamma + contrast + brightness to a single luminance value (0..255)
   Returns clamped 0..255 */
function adjustLuminance(v) {
  // normalize 0..1
  let n = v / 255;

  // gamma correction (use pow(n, gamma))
  if (SETTINGS.gamma !== 1.0 && SETTINGS.gamma > 0) {
    n = Math.pow(n, SETTINGS.gamma);
  }

  // to 0..255
  let value = n * 255;

  // contrast: simple linear multiplier around midpoint 128
  // value' = (value - 128) * contrast + 128 + brightness
  value = (value - 128) * SETTINGS.contrast + 128 + SETTINGS.brightness;

  // clamp
  return clamp(Math.round(value), 0, 255);
}

// Convert image to ASCII (brightness -> glyph)
// This function now applies gamma & contrast via adjustLuminance()
function imageToASCII(img){
  if(!img || !img.complete) return null;

  ctx.clearRect(0,0,off.width,off.height);
  // draw the image scaled to the offscreen resolution
  ctx.drawImage(img, 0, 0, off.width, off.height);

  const raw = ctx.getImageData(0,0,off.width,off.height).data;
  let out = "";

  // iterate pixels by row
  for (let y = 0; y < off.height; y++) {
    for (let x = 0; x < off.width; x++) {
      const i = (y * off.width + x) * 4;
      const r = raw[i], g = raw[i+1], b = raw[i+2];

      // luminance (perceived brightness)
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      // apply gamma + contrast + brightness
      const v = adjustLuminance(lum);

      // map to ramp index
      const ci = Math.floor((v / 255) * (RAMP.length - 1));
      out += RAMP[ci];
    }
    out += "\n";
  }

  return out;
}

function renderFrame(idx){
  idx = clamp(idx,0,frames.length-1);
  const ascii = imageToASCII(frames[idx]);
  if(ascii !== null) asciiEl.textContent = ascii;
}

function advanceFrame(){
  // if frames array empty, skip
  if (!frames.length) return;
  currentFrameIndex = (currentFrameIndex + 1) % frames.length;
  renderFrame(currentFrameIndex);
}

// Preload frames (no change)
function preloadFrames(){
  for(let i=1;i<=totalFrames;i++){
    const num = String(i).padStart(3,'0');
    const img = new Image();
    img.src = `frames/frame_${num}.png`;
    frames.push(img);
  }
}

// ----------------- init -----------------
preloadFrames();
computeOutputSize();
renderFrame(0);
setInterval(advanceFrame, frameRate);

window.addEventListener('resize',()=>{ 
  computeOutputSize(); 
  renderFrame(currentFrameIndex); 
});

// Staggered fade-in for everything below hero
const fadeElements = document.querySelectorAll('.content > *');
fadeElements.forEach((el, i) => {
  el.style.animationDelay = `${i * 0.3}s`;
});

// Staggered fade-in for projects list (kept for smaller internal delays)
const projectItems = document.querySelectorAll('.project-item');
projectItems.forEach((item,i)=> item.style.animationDelay = `${i*0.15}s`);

// Contact button - leave as-is (you already had it elsewhere if needed)
const contactBtn = document.getElementById('contactBtn');
if (contactBtn) {
  contactBtn.addEventListener('click', () => {
    const subject = encodeURIComponent("Freelance Design Inquiry");
    const body = encodeURIComponent("Hi Marcelo,\n\nI’d like to talk with you about a design project.\n\nBest regards,");
    // Use anchor click trick for reliability
    const a = document.createElement('a');
    a.href = `mailto:mrodriguescjr@gmail.com?subject=${subject}&body=${body}`;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  });
}
