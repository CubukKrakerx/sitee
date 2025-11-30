const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const restartBtn = document.getElementById("restartBtn");
const themeBtns = document.querySelectorAll(".theme-btn");
const scoreEl = document.getElementById("score");
const popup = document.getElementById("popup");
const popupYes = document.getElementById("popupYes");
const popupNo = document.getElementById("popupNo");

let theme = "classic";
let pendingTheme = null;
let gameInterval;

themeBtns.forEach(btn=>{
  btn.addEventListener("click", ()=>{
    pendingTheme = btn.dataset.theme;
    showPopup();
  });
});

function showPopup(){ popup.style.display="flex"; }
function hidePopup(){ popup.style.display="none"; }

popupYes.addEventListener("click", ()=>{
  theme = pendingTheme;
  pendingTheme = null;
  document.body.className = theme;
  initGame();
  hidePopup();
});

popupNo.addEventListener("click", ()=>{
  pendingTheme = null;
  hidePopup();
});

const grid = 20;
let snake, apple, dx, dy, score, speed, obstacles;

function initGame(){
  snake=[{x:10,y:10}];
  dx=0; dy=-1;
  score=0;
  speed=200;
  obstacles=[];
  placeApple();
  addObstacles();
  clearInterval(gameInterval);
  gameInterval = setInterval(gameLoop, speed);
  drawGame();
}

function placeApple(){
  let valid=false;
  while(!valid){
    apple={x:Math.floor(Math.random()*canvas.width/grid),
           y:Math.floor(Math.random()*canvas.height/grid)};
    valid=!snake.some(s=>s.x===apple.x && s.y===apple.y) && !obstacles.some(o=>o.x===apple.x && o.y===apple.y);
  }
}

function addObstacles(){
  if(theme==="cage"){
    for(let i=0;i<canvas.width/grid;i++){
      obstacles.push({x:i,y:0});
      obstacles.push({x:i,y:canvas.height/grid-1});
    }
    for(let i=1;i<canvas.height/grid-1;i++){
      obstacles.push({x:0,y:i});
      obstacles.push({x:canvas.width/grid-1,y:i});
    }
  } else if(theme==="crazy"){
    for(let i=0;i<5;i++){
      obstacles.push({x:Math.floor(Math.random()*canvas.width/grid),
                      y:Math.floor(Math.random()*canvas.height/grid)});
    }
  }
}

function drawGame(){
  ctx.clearRect(0,0,canvas.width,canvas.height);

  // arka plan rengi
  if(theme==="snow") ctx.fillStyle="#a0dfff";
  else if(theme==="desert") ctx.fillStyle="#f7e5a0";
  else if(theme==="slime") ctx.fillStyle="#88ff88";
  else ctx.fillStyle="#fff";
  ctx.fillRect(0,0,canvas.width,canvas.height);

  // engeller
  ctx.fillStyle="black";
  obstacles.forEach(o=>ctx.fillRect(o.x*grid,o.y*grid,grid,grid));

  // elma
  ctx.fillStyle="red";
  ctx.fillRect(apple.x*grid,apple.y*grid,grid,grid);

  // yılan
  ctx.fillStyle = theme==="crazy"? "#"+Math.floor(Math.random()*16777215).toString(16) :"#333";
  snake.forEach(s=>ctx.fillRect(s.x*grid,s.y*grid,grid,grid));

  scoreEl.textContent="Skor: "+score;
}

function gameLoop(){
  const head = {x:snake[0].x + dx, y:snake[0].y + dy};

  if(head.x<0||head.y<0||head.x>=canvas.width/grid||head.y>=canvas.height/grid
     ||snake.some(s=>s.x===head.x && s.y===head.y)
     ||obstacles.some(o=>o.x===head.x && o.y===head.y)){
    clearInterval(gameInterval);
    alert("Oyun Bitti! Skor: "+score);
    return;
  }

  snake.unshift(head);

  if(head.x===apple.x && head.y===apple.y){
    score++;
    placeApple();
    if(score%5===0 && speed>50){
      speed-=10;
      clearInterval(gameInterval);
      gameInterval=setInterval(gameLoop,speed);
    }
  } else snake.pop();

  drawGame();
}

// klavye
document.addEventListener("keydown", e=>{
  switch(e.code){
    case "ArrowUp": if(dy===0){dx=0;dy=-1;} break;
    case "ArrowDown": if(dy===0){dx=0;dy=1;} break;
    case "ArrowLeft": if(dx===0){dx=-1;dy=0;} break;
    case "ArrowRight": if(dx===0){dx=1;dy=0;} break;
    case "KeyW": if(dy===0){dx=0;dy=-1;} break;
    case "KeyS": if(dy===0){dx=0;dy=1;} break;
    case "KeyA": if(dx===0){dx=-1;dy=0;} break;
    case "KeyD": if(dx===0){dx=1;dy=0;} break;
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
  const dxSwipe = touch.clientX - canvas.touchStartX;
  const dySwipe = touch.clientY - canvas.touchStartY;

  if(Math.abs(dxSwipe)>Math.abs(dySwipe)){
    dxSwipe>0?moveSnake(1,0):moveSnake(-1,0);
  } else {
    dySwipe>0?moveSnake(0,1):moveSnake(0,-1);
  }
  canvas.touchStartX=null;
  canvas.touchStartY=null;
});

function moveSnake(newDx,newDy){
  if((newDx!==0 && dx===0)||(newDy!==0 && dy===0)){
    dx=newDx; dy=newDy;
  }
}

// yeniden başlat
restartBtn.addEventListener("click", initGame);

// başlat
initGame();
