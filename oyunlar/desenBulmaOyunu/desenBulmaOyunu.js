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
    // doğruysa kaydetmeye çalış (isteğe bağlı: Firestore yazma)
    try{ saveDesenScore(score); }catch(e){ /* ignore */ }
  } else {
    document.getElementById("result").textContent = `❌ Yanlış! Doğru cevap: ${correctAnswer}`;
    score -= 5;
  }

  document.getElementById("score").textContent = score;
  setTimeout(newSequence, 1500); // 1.5 sn sonra yeni desen
});

// Save helper: kaydetme (dinamik import ile Firebase modüllerini kullanır)
function saveDesenScore(score){
  try{
    (async ()=>{
      const { initializeApp } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js');
      const { getAuth, onAuthStateChanged } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js');
      const { getFirestore, doc, getDoc, setDoc, updateDoc, arrayUnion, increment } = await import('https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js');
      const firebaseConfig = {
        apiKey: "AIzaSyBqDkByV-2mdZOSP98kvTps5Yyhcw52ypM",
        authDomain: "pleahunt.firebaseapp.com",
        projectId: "pleahunt",
        storageBucket: "pleahunt.firebasestorage.app",
        messagingSenderId: "760890872647",
        appId: "1:760890872647:web:1684673d65f8282ffe7262"
      };
      const app = initializeApp(firebaseConfig);
      const auth = getAuth(app);
      const db = getFirestore(app);
      onAuthStateChanged(auth, async (user)=>{
        if (!user) return; // girişli değilse kaydetme yok
        const uid = user.uid;
        const ref = doc(db, 'profiles', uid);
        const snap = await getDoc(ref);
        if (!snap.exists()){
          await setDoc(ref, { desen_scores: [] }, { merge: true });
        }
        const entry = { score: Number(score), at: new Date().toISOString() };
        await updateDoc(ref, { desen_scores: arrayUnion(entry) });
        try{
          const coinsEarned = Math.floor(Number(score) / 200);
          if (coinsEarned > 0) await updateDoc(ref, { coins: increment(coinsEarned) });
        }catch(e){ console.warn('desen coin award failed', e); }
        if (window.DEBUG) console.debug('Saved desen score', entry);
      });
    })();
  }catch(e){ console.warn('saveDesenScore failed', e); }
}

newSequence(); // başlat
