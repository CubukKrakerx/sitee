let sequence = [];
let score = 0;
let correctAnswer = 0;

function newSequence() {
  const type = Math.floor(Math.random() * 3); // 3 farklı desen tipi
  let start = Math.floor(Math.random() * 10) + 1;
  let step = Math.floor(Math.random() * 5) + 1;

  sequence = [start];
  for (let i = 1; i < 5; i++) {
    if (type === 0) sequence.push(sequence[i - 1] + step); // + adım
    if (type === 1) sequence.push(sequence[i - 1] * 2); // ×2
    if (type === 2) sequence.push(sequence[i - 1] ** 2); // kare alma
  }

  correctAnswer = sequence.pop(); // son elemanı cevaba ayır
  document.getElementById("sequence").textContent = sequence.join(", ") + ", ?";
  document.getElementById("answer").value = "";
  document.getElementById("result").textContent = "";
}

document.getElementById("checkBtn").addEventListener("click", () => {
  const userAnswer = Number(document.getElementById("answer").value);

  if (userAnswer === correctAnswer) {
    document.getElementById("result").textContent = "✅ Doğru!";
    score += 10;
  } else {
    document.getElementById("result").textContent = `❌ Yanlış! Doğru cevap: ${correctAnswer}`;
    score -= 5;
  }

  document.getElementById("score").textContent = score;
  setTimeout(newSequence, 1500); // 1.5 sn sonra yeni desen
});

newSequence(); // başlat
