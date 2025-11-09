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
    // keep original name to check whether it changed
    const originalName = data.names || "";
  }

  // ----------------------------
  // 💾 Kaydetme işlemi
  // ----------------------------
  saveBtn.addEventListener("click", async () => {
    const username = newNameInput.value.trim();
    if (!username) {
      alert("Lütfen bir isim girin!");
      return;
    }

    // Eğer avatar seçilmemişse, mevcut avatarı kullan (selectedAvatar zaten yüklenmiş olabilir)
    if (!selectedAvatar) {
      // try to read existing avatar from profile
      const s = await getDoc(userRef);
      if (s.exists() && s.data().avatars) selectedAvatar = s.data().avatars;
    }

    // Eğer isim değişmemişse: sadece avatarı güncellemesine izin ver
    const nameChanged = (typeof originalName !== 'undefined') ? (username !== originalName) : true;

    // Haftalık isim değiştirme kontrolü yalnızca isim değiştiyse uygulanır
    if (nameChanged) {
      docSnap = await getDoc(userRef); // güncel veri
      if (docSnap.exists() && docSnap.data().lastNameUpdate) {
        const last = docSnap.data().lastNameUpdate.toDate();
        const now = new Date();
        const oneWeek = 7*24*60*60*1000;
        if (now - last < oneWeek) {
          alert("İsminizi haftada sadece 1 kez değiştirebilirsiniz!");
          return;
        }
      }
    }

    // Hazırlanacak güncelleme objesi
    const updates = { avatars: selectedAvatar };
    if (nameChanged) {
      updates.names = username;
      updates.lastNameUpdate = new Date();
    }

    await setDoc(userRef, updates, { merge: true });

    // Başarıyla kaydedilince yönlendirme
    window.location.href = "profil.html";
  });

  // Avatar-only save button (günlük/haftalık isim kısıtlamasına takılmadan avatar değişikliği yapar)
  const saveAvatarBtn = document.getElementById('saveAvatarBtn');
  if (saveAvatarBtn) {
    saveAvatarBtn.addEventListener('click', async () => {
      // ensure we have selectedAvatar or fallback to existing
      if (!selectedAvatar) {
        const s = await getDoc(userRef);
        if (s.exists() && s.data().avatars) selectedAvatar = s.data().avatars;
      }
      if (!selectedAvatar) { alert('Lütfen bir avatar seçin!'); return; }
      await setDoc(userRef, { avatars: selectedAvatar }, { merge: true });
      alert('Avatarınız güncellendi.');
      // redirect back to profile
      window.location.href = 'profil.html';
    });
  }
});
