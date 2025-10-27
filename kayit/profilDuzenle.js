// ----------------------------
// 🔥 Firebase modülleri
// ----------------------------
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

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
const db = getFirestore(app);
const auth = getAuth();

// ----------------------------
// 🧩 HTML elementleri
// ----------------------------
const saveBtn = document.getElementById("saveBtn");
const newNameInput = document.getElementById("newNameInput");
let selectedAvatar = null;

// ----------------------------
// 🎨 Avatar seçimi
// ----------------------------
document.querySelectorAll(".avatar-option").forEach(img => {
  img.addEventListener("click", () => {
    selectedAvatar = img.src;
    document.querySelectorAll(".avatar-option").forEach(i => i.style.border = "");
    img.style.border = "2px solid #0a84ff";
    const profilePicEl = document.getElementById("profilePic");
    if(profilePicEl) profilePicEl.src = selectedAvatar;
  });
});

// ----------------------------
// 🔐 Kullanıcı oturumu kontrol ve veri çekme
// ----------------------------
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  const userRef = doc(db, "profiles", user.uid); // UID bazlı belge

  // Mevcut veriyi çek
  let docSnap = await getDoc(userRef);
  if (docSnap.exists()) {
    const data = docSnap.data();
    newNameInput.value = data.names || "";
    if (data.avatars) {
      selectedAvatar = data.avatars;
      const profilePicEl = document.getElementById("profilePic");
      if(profilePicEl) profilePicEl.src = selectedAvatar;
    }
  }

  // ----------------------------
  // 💾 Kaydetme işlemi
  // ----------------------------
  saveBtn.addEventListener("click", async () => {
    const username = newNameInput.value.trim();
    if (!username || !selectedAvatar) {
      alert("Lütfen isim ve avatar seçin!");
      return;
    }

    // Haftalık isim değiştirme kontrolü
    let canUpdate = true;
    docSnap = await getDoc(userRef); // tekrar güncel veri çek
    if (docSnap.exists() && docSnap.data().lastNameUpdate) {
      const last = docSnap.data().lastNameUpdate.toDate();
      const now = new Date();
      const oneWeek = 7*24*60*60*1000;
      if (now - last < oneWeek) {
        canUpdate = false;
        alert("İsminizi haftada sadece 1 kez değiştirebilirsiniz!");
        return;
      }
    }

    if (canUpdate) {
      await setDoc(userRef, {
        names: username,
        avatars: selectedAvatar,
        lastNameUpdate: new Date()
      }, { merge: true }); // merge:true ile mevcut veriyi güncelle

      // Başarıyla kaydedilince yönlendirme
      window.location.href = "profil.html";
    }
  });
});
