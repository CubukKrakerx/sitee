const canvas = document.getElementById("mazeCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const themeBtns = document.querySelectorAll(".theme-btn");
const levelEl = document.getElementById("level");

// safe storage helpers
function safeGetStringLS(key, fallback = '') { try { const v = localStorage.getItem(key); return v === null || v === undefined ? fallback : String(v); } catch(e) { return fallback; } }
function safeSetLS(key, value) { try { localStorage.setItem(key, String(value)); } catch(e) { console.error('ls set failed', e); } }

let theme = safeGetStringLS("mazeTheme", "classic");
applyTheme(theme);

let rows = 11; // her zaman tek sayılı
let cols = 11;
let cellSize = canvas.width / cols;
let maze = [];
let player = {x:1,y:1};
let end = {x:cols-2, y:rows-2};
let level = 1;

// tema seçimi
themeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    theme = btn.dataset.theme;
    safeSetLS("mazeTheme", theme);
    applyTheme(theme);
    drawMaze();
  });
});

function applyTheme(t){
  document.body.classList.remove("night");
  if(t==="night") document.body.classList.add("night");
}

// DFS ile çözülebilir labirent oluşturma
function generateMaze(r,c){
  if(r%2===0) r++; // tek sayı
  if(c%2===0) c++;
  rows=r; cols=c;
  cellSize = canvas.width / cols;

  // tüm hücreleri duvar yap
  maze = Array.from({length:rows},()=>Array.from({length:cols},()=>1));

  // DFS ile yollar
  function shuffle(arr){return arr.sort(()=>Math.random()-0.5);}
  function carve(x,y){
    maze[y][x]=0;
    let dirs = shuffle([[0,-2],[0,2],[-2,0],[2,0]]);
    for(let [dx,dy] of dirs){
      let nx=x+dx, ny=y+dy;
      if(nx>0 && ny>0 && nx<cols-1 && ny<rows-1 && maze[ny][nx]===1){
        maze[y+dy/2][x+dx/2]=0; // ara duvarı kaldır
        carve(nx,ny);
      }
    }
  }

  carve(1,1);
  player={x:1,y:1};
  end={x:cols-2,y:rows-2};
}

function drawMaze(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let y=0;y<rows;y++){
    for(let x=0;x<cols;x++){
      if(maze[y][x]===1){
        ctx.fillStyle = theme==="night" ? "#888" : "#333";
        ctx.fillRect(x*cellSize, y*cellSize, cellSize, cellSize);
      }
    }
  }
  // bitiş
  ctx.fillStyle="green";
  ctx.fillRect(end.x*cellSize,end.y*cellSize,cellSize,cellSize);
  // oyuncu
  ctx.fillStyle="red";
  ctx.fillRect(player.x*cellSize,player.y*cellSize,cellSize,cellSize);

  levelEl.textContent="Seviye: "+level;
}

function movePlayer(dx,dy){
  let nx=player.x+dx, ny=player.y+dy;
  if(nx<0||ny<0||nx>=cols||ny>=rows) return;
  if(maze[ny][nx]===1) return;
  player.x=nx; player.y=ny;
  drawMaze();
  checkWin();
}

function checkWin(){
  if(player.x===end.x && player.y===end.y){
    setTimeout(()=>{
      alert("Tebrikler! Çıkışı buldun 🎉");
      level++;
      generateMaze(rows+2,cols+2);
      drawMaze();
    },100);
  }
}

// klavye ok tuşları + WASD
document.addEventListener("keydown", e=>{
  switch(e.code){
    case "ArrowUp":
    case "KeyW": movePlayer(0,-1); break;
    case "ArrowDown":
    case "KeyS": movePlayer(0,1); break;
    case "ArrowLeft":
    case "KeyA": movePlayer(-1,0); break;
    case "ArrowRight":
    case "KeyD": movePlayer(1,0); break;
  }
});

// dokunmatik kaydırma
canvas.addEventListener("touchstart", e=>{
  const touch=e.touches[0];
  canvas.touchStartX=touch.clientX;
  canvas.touchStartY=touch.clientY;
});
canvas.addEventListener("touchend", e=>{
  if(canvas.touchStartX==null || canvas.touchStartY==null) return;
  const touch=e.changedTouches[0];
  const dx=touch.clientX-canvas.touchStartX;
  const dy=touch.clientY-canvas.touchStartY;

  if(Math.abs(dx)>Math.abs(dy)){
    dx>0?movePlayer(1,0):movePlayer(-1,0);
  } else {
    dy>0?movePlayer(0,1):movePlayer(0,-1);
  }
  canvas.touchStartX=null;
  canvas.touchStartY=null;
});

// yeniden başlat
restartBtn.addEventListener("click", ()=>{
  level=1;
  generateMaze(11,11);
  drawMaze();
});

generateMaze(rows,cols);
drawMaze();
