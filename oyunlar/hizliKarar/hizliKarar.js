const commandEl = document.getElementById("command");
const scoreEl = document.getElementById("score");
const restartEl = document.getElementById("restart");
const bestScoreEl = document.getElementById("bestScore");
const restartBtn = document.getElementById("restartBtn");
const buttonsContainer = document.querySelector(".buttons");
let buttons = document.querySelectorAll(".color-btn");

const timerBar = document.getElementById("timer-fill");
const timeText = document.getElementById("time-text");

const baseColors = ["red", "green", "blue", "yellow"];
let currentColors = [...baseColors]; // her tur buton renkleri buradan okunacak

const features = [
  "colorTextMismatch",
  "colorShift",
  "hiddenColors",
  "reverseCommand",
  "fakeCommand",
  "addColor",
  "positionCommand",
  "glitchMode",
  "delayedCommand",
  "slowMotion"
];

let currentCommand = null;
let allowInput = false;
let score = 0;
let round = 1;
let timer = null;
let timeLeft = 0;
let totalTime = 0;
let timerInterval = null;
let featureActive = false;

// safe localStorage helper
function safeGetIntLS(key, fallback = 0) {
  try { const raw = localStorage.getItem(key); if (raw === null || raw === undefined) return fallback; const n = parseInt(raw); return Number.isNaN(n) ? fallback : n; } catch(e) { return fallback; }
}
function safeSetLS(key, val) { try { localStorage.setItem(key, String(val)); } catch(e) { console.error('ls set failed', e); } }

let bestScore = safeGetIntLS("bestScore", 0);
bestScoreEl.textContent = `Rekor: ${bestScore}`;

// ------------------------
// Yeni tur başlat
// ------------------------
function newRound() {
  allowInput = true;

  // Tur rengini belirle
  const action = Math.random() < 0.5 ? "bas" : "basma";
  let colorForCommand = currentColors[Math.floor(Math.random() * currentColors.length)];
  currentCommand = { color: colorForCommand, action };

  clearTimeout(timer);
  clearInterval(timerInterval);

  totalTime = Math.max(2500 - round * 60, 1200);
  timeLeft = totalTime;
  updateTimerUI();
  timerInterval = setInterval(updateTimer, 100);
  timer = setTimeout(gameOver, totalTime + 50);

  // 3'ün katı tur ise rastgele özellik
  if (round % 3 === 0) {
    if (!featureActive) {
      featureActive = true;
      const randomFeature = features[Math.floor(Math.random() * features.length)];
      activateFeature(randomFeature, () => { featureActive = false; });
    }
  } else {
    showNormalCommand();
  }

  updateButtonColors(); // buton renklerini güncelle
}

// ------------------------
// Normal komut göster
// ------------------------
function showNormalCommand() {
  commandEl.textContent = `${getColorEmoji(currentCommand.color)} ${capitalize(currentCommand.color)} rengine ${currentCommand.action}!`;
}

// ------------------------
// Özellik aktivasyonu
// ------------------------
function activateFeature(feature, callback) {
  switch(feature) {
    case "colorTextMismatch":
      const randomTextColor = currentColors[Math.floor(Math.random() * currentColors.length)];
      commandEl.textContent = `${getColorEmoji(randomTextColor)} ${capitalize(randomTextColor)} rengine ${currentCommand.action}!`;
      break;
    case "colorShift":
      shuffleButtons();
      showNormalCommand();
      break;
    case "hiddenColors":
      hideButtonsTemporarily(callback);
      return;
    case "reverseCommand":
      currentCommand.action = currentCommand.action === "bas" ? "basma" : "bas";
      showNormalCommand();
      break;
    case "fakeCommand":
      commandEl.textContent = "👀 Hangisiydi ki az önce?";
      allowInput = false;
      clearTimeout(timer);
      clearInterval(timerInterval);
      setTimeout(() => { allowInput = true; showNormalCommand(); }, 800);
      break;
    case "addColor":
      // Artık yeni renk buton eklemeden, mevcut butonlardan birini değiştir
      const newColor = "purple";
      const randBtnIdx = Math.floor(Math.random() * buttons.length);
      currentColors[randBtnIdx] = newColor; // butonun rengi değişir
      currentCommand.color = newColor;
      showNormalCommand();
      break;
    case "positionCommand":
      commandEl.textContent = `⏹ ${capitalize(currentCommand.color)} rengine ${currentCommand.action}! (pozisyonu hatırla)`;
      break;
    case "glitchMode":
      glitchEffect();
      showNormalCommand();
      break;
    case "delayedCommand":
      allowInput = false;
      setTimeout(() => { allowInput = true; showNormalCommand(); }, 700);
      break;
    case "slowMotion":
      totalTime += 800;
      showNormalCommand();
      break;
  }
  if (callback) callback();
}

// ------------------------
// Buton renklerini güncelle
// ------------------------
function updateButtonColors() {
  buttons.forEach((btn, idx) => {
    const color = currentColors[idx];
    btn.dataset.color = color;
    btn.style.background = getColorStyle(color);
  });
}

function getColorStyle(color) {
  switch(color) {
    case "red": return "#ff3b30";
    case "green": return "#34c759";
    case "blue": return "#007aff";
    case "yellow": return "#ffcc00";
    case "purple": return "#800080";
    default: return "#fff";
  }
}

// ------------------------
// Yardımcı fonksiyonlar
// ------------------------
function shuffleButtons() {
  const parent = buttonsContainer;
  for (let i = buttons.length; i >= 0; i--) {
    parent.appendChild(buttons[Math.random() * i | 0]);
  }
}

function hideButtonsTemporarily(callback) {
  buttons.forEach(btn => btn.style.visibility = "hidden");
  setTimeout(() => {
    buttons.forEach(btn => btn.style.visibility = "visible");
    if (callback) callback();
  }, 600);
}

function updateTimer() {
  timeLeft -= 100;
  if (timeLeft < 0) timeLeft = 0;
  updateTimerUI();
}

function updateTimerUI() {
  const progress = (timeLeft / totalTime) * 100;
  timerBar.style.width = progress + "%";
  timeText.textContent = `Süre: ${(timeLeft / 1000).toFixed(1)}s`;
}

function getColorEmoji(color) {
  switch (color) {
    case "red": return "🟥";
    case "green": return "🟩";
    case "blue": return "🟦";
    case "yellow": return "🟨";
    case "purple": return "🟪";
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// ------------------------
// Oyun kontrol
// ------------------------
function handleClick(e) {
  if (!allowInput) return;
  allowInput = false;
  clearTimeout(timer);
  clearInterval(timerInterval);

  const clickedColor = e.target.dataset.color;
  const correct =
    (currentCommand.action === "bas" && clickedColor === currentCommand.color) ||
    (currentCommand.action === "basma" && clickedColor !== currentCommand.color);

  if (correct) {
    score += 10;
    round++;
    scoreEl.textContent = `Skor: ${score}`;
    e.target.classList.add("flash");
    setTimeout(() => e.target.classList.remove("flash"), 150);
    setTimeout(newRound, 400);
  } else {
    gameOver();
  }
}

function gameOver() {
  allowInput = false;
  commandEl.textContent = "😵 Oyun Bitti!";
  clearInterval(timerInterval);
  restartEl.classList.remove("hidden");
  if (score > bestScore) {
    bestScore = score;
    safeSetLS("bestScore", bestScore);
    bestScoreEl.textContent = `Rekor: ${bestScore}`;
  }
}

function restartGame() {
  score = 0;
  round = 1;
  featureActive = false;
  currentColors = [...baseColors]; // renkleri sıfırla
  restartEl.classList.add("hidden");
  scoreEl.textContent = "Skor: 0";
  updateButtonColors();
  newRound();
}

function glitchEffect() {
  commandEl.style.transform = "rotate(" + (Math.random() * 10 - 5) + "deg)";
  commandEl.style.filter = "blur(1px)";
  setTimeout(() => {
    commandEl.style.transform = "";
    commandEl.style.filter = "";
  }, 300);
}

buttons.forEach(btn => btn.addEventListener("click", handleClick));
restartBtn.addEventListener("click", restartGame);

setTimeout(newRound, 1500);
