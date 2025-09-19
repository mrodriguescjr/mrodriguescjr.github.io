const asciiEl = document.getElementById('ascii');
const off = document.getElementById('offscreen');
const ctx = off.getContext('2d');
const RAMP = "$@B%8&WM#*oahkbdpqwmZO0QLCJUYXzcvunxrjft/\\|()1{}[]?-_+~<>i!lI;:,'\"^`'.";

let frames = [];
let currentFrameIndex = 0;
const totalFrames = 480; // frame_001 to frame_480
const frameRate = 41; // ms per frame

function clamp(v,a,b){ return Math.max(a, Math.min(b,v)); }

function computeOutputSize() {
  const margin = 20;
  const W = window.innerWidth - 2*margin;
  const H = window.innerHeight * 0.4;

  off.width = Math.floor(W / 4);
  off.height = Math.floor(H / 6);

  asciiEl.style.fontSize = "8px"; // fixed typo "8x" -> "8px"
  asciiEl.style.lineHeight = "8px";

  return {W,H};
}

function imageToASCII(img){
  if(!img || !img.complete) return null;
  ctx.clearRect(0,0,off.width,off.height);
  ctx.drawImage(img,0,0,off.width,off.height);
  const data = ctx.getImageData(0,0,off.width,off.height).data;
  let out="";
  for(let y=0;y<off.height;y++){
    for(let x=0;x<off.width;x++){
      const i = (y*off.width + x)*4;
      const v = 0.299*data[i]+0.587*data[i+1]+0.114*data[i+2];
      const ci = Math.floor((v/255)*(RAMP.length-1));
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
  currentFrameIndex = (currentFrameIndex + 1) % frames.length;
  renderFrame(currentFrameIndex);
}

function preloadFrames(){
  for(let i=1;i<=totalFrames;i++){
    const num = String(i).padStart(3,'0');
    const img = new Image();
    img.src = `frames/frame_${num}.png`; // adjust path if needed
    frames.push(img);
  }
}

preloadFrames();
computeOutputSize();
renderFrame(0);
setInterval(advanceFrame, frameRate);

window.addEventListener('resize',()=>{ 
  computeOutputSize(); 
  renderFrame(currentFrameIndex); 
});

// staggered fade-in for projects
const projectItems = document.querySelectorAll('.project-item');
projectItems.forEach((item,i)=> item.style.animationDelay = `${i*0.15}s`);
