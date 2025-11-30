import { initializeApp } from "[https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js](https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js)";
import { getFirestore, doc, setDoc, getDoc } from "[https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js](https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js)";
import { getAuth, onAuthStateChanged } from "[https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js](https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js)";

// ----------------------------
// 🔧 Firebase config (React + Netlify env)
// ----------------------------
const firebaseConfig = {
apiKey: process.env.REACT_APP_API_KEY,
authDomain: process.env.REACT_APP_AUTH_DOMAIN,
projectId: process.env.REACT_APP_PROJECT_ID,
storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
appId: process.env.REACT_APP_APP_ID,
measurementId: process.env.REACT_APP_MEASUREMENT_ID
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
const saveAvatarBtn = document.getElementById("saveAvatarBtn");
const newNameInput = document.getElementById("newNameInput");
let originalName = "";
let selectedAvatar = null;

// ----------------------------
// 🎨 Avatar seçimi
// ----------------------------
function setupAvatarSelection() {
document.querySelectorAll(".avatar-option").forEach(img => {
img.addEventListener("click", () => {
selectedAvatar = img.src;
document.querySelectorAll(".avatar-option").forEach(i => i.style.border = "");
img.style.border = "2px solid #0a84ff";
const profilePicEl = document.getElementById("profilePic");
if(profilePicEl) profilePicEl.src = selectedAvatar;
});
});
}

// ----------------------------
// 🔐 Kullanıcı oturumu kontrol ve veri çekme
// ----------------------------
onAuthStateChanged(auth, async (user) => {
if (!user) {
window.location.href = "login.html";
return;
}

const userRef = doc(db, "profiles", user.uid);
newNameInput.value = "yükleniyor...";

// Mevcut veriyi çek
const docSnap = await getDoc(userRef);
if (docSnap.exists()) {
const data = docSnap.data();
newNameInput.value = data.names || "";
originalName = data.names || "";

```
if (data.avatars) {
  selectedAvatar = data.avatars;
  const profilePicEl = document.getElementById("profilePic");
  if(profilePicEl) profilePicEl.src = selectedAvatar;
}

// Marketten alınan öğeleri kontrol et ve avatar seçeneklerine ekle
const ownedItems = data.ownedItems || [];
const avatarSelectDiv = document.querySelector("#avatarSelect div");
if (avatarSelectDiv) {
  if (ownedItems.includes('pp1')) {
    const pp1Img = document.createElement('img');
    pp1Img.src = '/dosyalar/resimler/profiller/pp1.png';
    pp1Img.className = 'avatar-option';
    pp1Img.width = 50;
    pp1Img.height = 50;
    avatarSelectDiv.appendChild(pp1Img);
  }
  if (ownedItems.includes('pp2')) {
    const pp2Img = document.createElement('img');
    pp2Img.src = '/dosyalar/resimler/profiller/pp2.png';
    pp2Img.className = 'avatar-option';
    pp2Img.width = 50;
    pp2Img.height = 50;
    avatarSelectDiv.appendChild(pp2Img);
  }
}
```

}

// Avatar seçimi olaylarını ayarla (mevcut + yeni eklenenler)
setupAvatarSelection();

// ----------------------------
// 💾 Kaydetme işlemi
// ----------------------------
saveBtn?.addEventListener("click", async () => {
const username = newNameInput.value.trim();
if (!username) { alert("Lütfen bir isim girin!"); return; }

```
// Avatar fallback
if (!selectedAvatar) {
  const s = await getDoc(userRef);
  if (s.exists() && s.data().avatars) selectedAvatar = s.data().avatars;
}

const nameChanged = (username !== originalName);

// Haftalık isim değiştirme kontrolü
if (nameChanged) {
  const s = await getDoc(userRef);
  const lastRaw = s.exists() ? s.data().lastNameUpdate : null;
  let last = null;
  if (lastRaw?.toDate) last = lastRaw.toDate();
  else if (typeof lastRaw === 'string') last = new Date(lastRaw);
  else if (lastRaw instanceof Date) last = lastRaw;
  const now = new Date();
  const oneWeek = 7*24*60*60*1000;
  if (last && (now - last < oneWeek)) {
    alert("İsminizi haftada sadece 1 kez değiştirebilirsiniz!");
    return;
  }
}

const updates = { avatars: selectedAvatar };
if (nameChanged) {
  updates.names = username;
  updates.lastNameUpdate = new Date();
}

await setDoc(userRef, updates, { merge: true });
window.location.href = "profil.html";
```

});

// Avatar-only kaydetme (isim kısıtlamasına takılmaz)
saveAvatarBtn?.addEventListener('click', async () => {
if (!selectedAvatar) {
const s = await getDoc(userRef);
if (s.exists() && s.data().avatars) selectedAvatar = s.data().avatars;
}
if (!selectedAvatar) { alert('Lütfen bir avatar seçin!'); return; }
await setDoc(userRef, { avatars: selectedAvatar }, { merge: true });
alert('Avatarınız güncellendi.');
window.location.href = 'profil.html';
});
});
