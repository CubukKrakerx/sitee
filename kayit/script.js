// ----------------------------
// 🔥 Firebase modülleri
// ----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// ----------------------------
// 🔧 Firebase config
// ----------------------------
const firebaseConfig = {
  apiKey: "AIzaSyBqDkByV-2mdZOSP98kvTps5Yyhcw52ypM",
  authDomain: "pleahunt.firebaseapp.com",
  projectId: "pleahunt",
  storageBucket: "pleahunt.firebasestorage.app",
  messagingSenderId: "760890872647",
  appId: "1:760890872647:web:1684673d65f8282ffe7262",
  measurementId: "G-Q0BDPXCXGQ"
};


// ----------------------------
// 🚀 Firebase başlat
// ----------------------------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ----------------------------
// 🧩 KAYIT OLMA
// ----------------------------
const registerBtn = document.getElementById("registerBtn");
if (registerBtn) {
  registerBtn.addEventListener("click", async () => {
    const email = document.getElementById("registerEmail").value;
    const password = document.getElementById("registerPassword").value;
    const message = document.getElementById("registerMessage");

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      message.textContent = "✅ Kayıt başarılı! Giriş sayfasına yönlendiriliyorsun...";
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1500);
    } catch (error) {
      message.textContent = "❌ Hata: " + error.message;
    }
  });
}

// ----------------------------
// 🔐 GİRİŞ YAPMA
// ----------------------------
const loginBtn = document.getElementById("loginBtn");
if (loginBtn) {
  loginBtn.addEventListener("click", async () => {
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;
    const message = document.getElementById("loginMessage");

    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.textContent = "✅ Giriş başarılı! Profil sayfasına yönlendiriliyorsun...";
      setTimeout(() => {
        window.location.href = "profil.html";
      }, 1500);
    } catch (error) {
      message.textContent = "❌ Hata: " + error.message;
    }
  });
}

// ----------------------------
// 🧠 PROFİL SİSTEMİ
// ----------------------------
const userEmail = document.getElementById("userEmail");
const logoutBtn = document.getElementById("logoutBtn");

if (userEmail) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      userEmail.textContent = "E-posta: " + user.email;

      const userRef = doc(db, "profiles", user.uid);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const data = userSnap.data();

        // Profil fotoğrafı
        if (data.avatars) document.getElementById("profilePic").src = data.avatars;

        // Kullanıcı adı
        if (data.names) document.getElementById("userName").textContent = data.names;

        // ----------------------------
        // ⚡ İstatistikleri yazdır
        // ----------------------------
        // Firestore'da score_lightSequence veya colorGameScore yoksa, bestScore kullan
        const bestScore = data.bestScore || 0;
        const lightScore = data.score_lightSequence ?? bestScore;
        const colorScore = data.colorGameScore ?? bestScore;

        const scoreLightElem = document.getElementById("score-password");
        const scoreColorElem = document.getElementById("score-color");
        const totalScoreElem = document.getElementById("totalScore");

        if (scoreLightElem) scoreLightElem.textContent = lightScore;
        if (scoreColorElem) scoreColorElem.textContent = colorScore;
        if (totalScoreElem) totalScoreElem.textContent = lightScore + colorScore;

        // ----------------------------
        // Avatar seçimi
        // ----------------------------
        document.querySelectorAll(".avatar-option").forEach((img) => {
          img.addEventListener("click", async () => {
            const selected = img.getAttribute("src");
            document.getElementById("profilePic").src = selected;

            await setDoc(userRef, { avatars: selected }, { merge: true });
            alert("Profil fotoğrafın güncellendi ✅");
          });
        });

        // ----------------------------
        // İsim değiştirme
        // ----------------------------
        const nameInput = document.getElementById("nameInput");
        const saveNameBtn = document.getElementById("saveNameBtn");

        if (saveNameBtn) {
          saveNameBtn.addEventListener("click", async () => {
            const newName = nameInput.value.trim();
            if (!newName) return alert("İsim boş olamaz");

            const docSnap2 = await getDoc(userRef);
            let canUpdate = true;

            if (docSnap2.exists()) {
              const data = docSnap2.data();
              if (data.lastNameUpdate) {
                // data.lastNameUpdate may be a Firestore Timestamp, string, or Date
                const raw = data.lastNameUpdate;
                let last = null;
                if (raw && typeof raw === 'object' && typeof raw.toDate === 'function') last = raw.toDate();
                else if (typeof raw === 'string') last = new Date(raw);
                else if (raw instanceof Date) last = raw;
                const now = new Date();
                const oneWeek = 7 * 24 * 60 * 60 * 1000; // haftada 1
                if (last && (now - last < oneWeek)) {
                  canUpdate = false;
                  alert("İsminizi haftada sadece 1 kez değiştirebilirsiniz!");
                }
              }
            }

            if (canUpdate) {
              await setDoc(userRef, { names: newName, lastNameUpdate: new Date() }, { merge: true });
              document.getElementById("userName").textContent = newName;
              alert("İsminiz başarıyla güncellendi ✅");
              window.location.href = "profil.html"; // kaydet sonrası yönlendirme
            }
          });
        }

      } else {
        if (window.DEBUG) console.debug("Kullanıcı verisi bulunamadı.");
      }

    } else {
      window.location.href = "login.html";
    }
  });
}

// ----------------------------
// 🚪 ÇIKIŞ YAP
// ----------------------------
if (logoutBtn) {
  logoutBtn.addEventListener("click", async () => {
    await signOut(auth);
    window.location.href = "login.html";
  });
}
