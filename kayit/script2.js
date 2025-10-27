// Firebase modüllerini import et
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// Firestore ve Auth referanslarını al
const db = getFirestore();
const auth = getAuth();
const app = initializeApp(firebaseConfig);

// Kullanıcı giriş yaptığında coinleri yükle
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const userRef = doc(db, "users", user.uid);

        // Kullanıcı Firestore'da yoksa oluştur
        const userSnap = await getDoc(userRef);
        if (!userSnap.exists()) {
            await setDoc(userRef, { coins: 0 });
        }

        // Coinleri ekrana yazdır
        const data = await getDoc(userRef);
        const coins = data.data().coins;
        document.getElementById("coinDisplay").innerText = `Coins: ${coins}`;
    } else {
        console.log("Kullanıcı giriş yapmamış");
    }
});

// Coin ekleme fonksiyonu
async function addCoins(amount) {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    await updateDoc(userRef, {
        coins: increment(amount)
    });

    // Güncel coinleri ekrana yaz
    const data = await getDoc(userRef);
    document.getElementById("coinDisplay").innerText = `Coins: ${data.data().coins}`;
}

// Örnek butona bağlama
document.getElementById("addCoinButton").addEventListener("click", () => {
    addCoins(10); // Butona tıklanınca 10 coin ekle
});

// script.js içinde
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

// script2.js
export async function rewardCoins(db, auth, amount) {
    const user = auth.currentUser;
    if(!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { coins: increment(amount) });

    const data = await getDoc(userRef);
    const coinEl = document.getElementById("coinDisplay");
    if(coinEl) coinEl.innerText = `Coins: ${data.data().coins}`;
}

import { rewardCoins } from './script2.js';
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Skor arttığında
score += gained;
scoreEl.textContent = score;

const coinsToReward = Math.floor(score / 200) - Math.floor((score - gained) / 200);
if(coinsToReward > 0){
    rewardCoins(db, auth, coinsToReward);
}

// script2.js
import { doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

export async function rewardCoins(db, auth, amount) {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { coins: increment(amount) });

    const data = await getDoc(userRef);
    const coinEl = document.getElementById("coinDisplay");
    if (coinEl) coinEl.innerText = `Coins: ${data.data().coins}`;
}

import { doc, getDoc, updateDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Coin ekleme fonksiyonu (daha önceki rewardCoins)
export async function rewardCoins(db, auth, amount) {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { coins: increment(amount) });

    const data = await getDoc(userRef);
    const coinEl = document.getElementById("coinDisplay");
    if (coinEl) coinEl.innerText = `Coins: ${data.data().coins}`;
}

// Günlük ödül fonksiyonu
export async function claimDailyReward(db, auth) {
    const user = auth.currentUser;
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);
    const data = userSnap.data();

    const now = Date.now();
    const lastClaim = data.lastDailyReward?.toMillis() || 0;
    const diff = now - lastClaim;

    if (diff < 24 * 60 * 60 * 1000) {
        // Hala 24 saat dolmadı
        alert("Günlük ödül zaten alındı. Lütfen bekleyin!");
        return;
    }

    // Ödülü ver
    await updateDoc(userRef, {
        coins: increment(10),
        lastDailyReward: serverTimestamp()
    });

    // Coin göstergesini güncelle
    const coinEl = document.getElementById("coinDisplay");
    if (coinEl) coinEl.innerText = `${data.coins + 10 || 10}`;
}
