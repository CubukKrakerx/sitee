// Arkadaşlık sistemi (düzeltilmiş)
// Bu dosya: mevcut Firebase uygulamasını kullanır (uygulama zaten `script.js` tarafından initialize ediliyor).
import { getApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
    getFirestore,
    collection,
    query,
    where,
    getDocs,
    doc,
    getDoc,
    updateDoc,
    setDoc,
    arrayUnion,
    arrayRemove,
    increment
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";

const app = getApp(); // script.js zaten initialize ettiği için tekrar initialize etmiyoruz
const db = getFirestore(app);
const auth = getAuth(app);

// Market items (simple catalog). image urls should be adjusted to real images in your project.
const MARKET_ITEMS = [
    { id: 'pp1', title: 'Profil Foto 1', price: 50, image: '/dosyalar/resimler/profiller/pp1.png' },
    { id: 'pp2', title: 'Profil Foto 2', price: 120, image: '/dosyalar/resimler/profiller/pp2.png' },
    { id: 'daily10', title: 'Günlük +10 Coin', price: 0, image: '/dosyalar/resimler/coin.png', note: 'Günde 1 kez alınabilir' }
];

function generateUserIdCode() {
    return (Math.floor(Math.random() * 90000000000) + 10000000000).toString(); // 11 haneli string
}

// Benzersiz ID üret (Firestore'da çakışma yoksa döner)
async function generateUniqueUserIdCode() {
    // Güvenlik için bir tekrar limiti koyuyoruz
    const maxAttempts = 10;
    for (let i = 0; i < maxAttempts; i++) {
        const code = generateUserIdCode();
        const q = query(collection(db, "profiles"), where("userIdCode", "==", code));
        const snap = await getDocs(q);
        if (snap.empty) return code;
        // aksi halde tekrar dene
    }
    // Çok nadir durum: hala çakışma varsa timestamp ekleyip döndür
    return generateUserIdCode() + Date.now().toString().slice(-3);
}

async function ensureProfileExists(uid, fallbackName = "Kullanıcı") {
    const ref = doc(db, "profiles", uid);
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        const unique = await generateUniqueUserIdCode();
        await setDoc(ref, { names: fallbackName, userIdCode: unique, friends: [], friendRequests: [] });
        return (await getDoc(ref)).data();
    }
    const data = snap.data();
    // eksik alanlar varsa ekle
    const updates = {};
    if (!data.userIdCode) updates.userIdCode = await generateUniqueUserIdCode();
    if (!Array.isArray(data.friends)) updates.friends = [];
    if (!Array.isArray(data.friendRequests)) updates.friendRequests = [];
    if (Object.keys(updates).length) await updateDoc(ref, updates);
    return (await getDoc(ref)).data();
}

// Gönderme: userIdCode ile arama yap
async function sendFriendRequest(senderUid, receiverIdCode) {
    try {
        const q = query(collection(db, "profiles"), where("userIdCode", "==", receiverIdCode));
        const snap = await getDocs(q);
        if (snap.empty) return alert("Kullanıcı bulunamadı!");
        const receiverDoc = snap.docs[0];
        // receiver tarafına istek ekle
        await updateDoc(receiverDoc.ref, { friendRequests: arrayUnion({ from: senderUid, status: "pending" }) });
        alert("Arkadaşlık isteği gönderildi!");
    } catch (e) {
        console.error(e);
        alert("İstek gönderilirken hata oluştu.");
    }
}

async function respondFriendRequest(currentUid, senderUid, action) {
    try {
        const currentRef = doc(db, "profiles", currentUid);
        const senderRef = doc(db, "profiles", senderUid);

        if (action === "accept") {
            await updateDoc(currentRef, { friends: arrayUnion(senderUid) });
            await updateDoc(senderRef, { friends: arrayUnion(currentUid) });
        }

        // İsteği current user'un friendRequests array’inden çıkar (daha güvenli şekilde filtreleyerek)
        const currentSnap = await getDoc(currentRef);
        const currentData = currentSnap.data();
        const newRequests = (currentData.friendRequests || []).filter(req => req.from !== senderUid);
        await updateDoc(currentRef, { friendRequests: newRequests });
    } catch (e) {
        console.error(e);
        alert("İstek işlenirken hata oluştu.");
    }
}

async function removeFriend(currentUid, friendUid) {
    try {
        const currentRef = doc(db, "profiles", currentUid);
        const friendRef = doc(db, "profiles", friendUid);
        await updateDoc(currentRef, { friends: arrayRemove(friendUid) });
        await updateDoc(friendRef, { friends: arrayRemove(currentUid) });
        // UI yenilemesi çağıran tarafça yapılmalı
    } catch (e) {
        console.error(e);
        alert("Arkadaş silinirken hata oluştu.");
    }
}

// UI fonksiyonları (modül scope içinde, global onclick kullanmıyoruz)
async function showFriendsUid(currentUid) {
    const listContainer = document.getElementById("friendsList");
    if (!listContainer) return;
    listContainer.innerHTML = "";

    const userSnap = await getDoc(doc(db, "profiles", currentUid));
    const friends = (userSnap.data() && userSnap.data().friends) || [];
    if (!friends || friends.length === 0) {
        listContainer.innerHTML = `<div class="empty-friends">Arkadaş yok</div>`;
        return;
    }

    for (let friendUid of friends) {
        const friendSnap = await getDoc(doc(db, "profiles", friendUid));
        const friendData = friendSnap.exists() ? friendSnap.data() : { names: "Bilinmeyen", userIdCode: "-" };
        const div = document.createElement("div");
        div.className = "friend-item";

        const left = document.createElement("div");
        left.className = "friend-left";
        const img = document.createElement("img");
        img.className = "friend-avatar";
        img.src = friendData.avatars || "/dosyalar/resimler/profiller/oyuncuPpVarsayılan.png";
        img.alt = "avatar";

        const textWrap = document.createElement("div");
        const nameEl = document.createElement("div");
        nameEl.className = "friend-name";
        nameEl.textContent = friendData.names || friendData.username || 'Bilinmeyen';
        const idEl = document.createElement("div");
        idEl.className = "friend-id";
        idEl.textContent = `ID: ${friendData.userIdCode || '-'}`;

        textWrap.appendChild(nameEl);
        textWrap.appendChild(idEl);
        left.appendChild(img);
        left.appendChild(textWrap);

        const actions = document.createElement("div");
        actions.className = "friend-actions";
        const removeBtn = document.createElement("button");
        removeBtn.className = "remove";
        removeBtn.textContent = "Sil";
        removeBtn.addEventListener("click", async () => {
            if (!confirm("Arkadaşı silmek istediğine emin misin?")) return;
            await removeFriend(currentUid, friendUid);
            await showFriendsUid(currentUid);
            await loadIncomingRequests(currentUid);
        });
        // statistics button for this friend
        const statsBtn = document.createElement('button');
        statsBtn.className = 'coolbtn';
        statsBtn.style.padding = '6px 10px';
        statsBtn.style.background = '#3498db';
        statsBtn.style.color = '#fff';
        statsBtn.style.border = 'none';
        statsBtn.style.borderRadius = '8px';
        statsBtn.textContent = 'İstatistik';
        statsBtn.addEventListener('click', async () => {
            const statsModal = document.getElementById('statsModal');
            const sel = document.getElementById('statsGameSelect');
            const gameKey = sel ? sel.value : 'balon';
            // set modal dataset so change handler knows whose stats to fetch
            if (statsModal) {
                statsModal.dataset.targetUid = friendUid;
                statsModal.dataset.ownerLabel = friendData.names || friendData.username || 'Bilinmeyen';
                statsModal.style.display = 'flex';
            }
            await fetchAndShowGameStats(friendUid, gameKey, friendData.names || friendData.username || 'Bilinmeyen');
        });
        actions.appendChild(removeBtn);
        actions.appendChild(statsBtn);

        div.appendChild(left);
        div.appendChild(actions);
        listContainer.appendChild(div);
    }
}

async function loadIncomingRequests(currentUid) {
    const container = document.getElementById("incomingRequests");
    if (!container) return;
    container.innerHTML = "";

    const userSnap = await getDoc(doc(db, "profiles", currentUid));
    const requests = (userSnap.data() && userSnap.data().friendRequests) || [];
    if (!requests || requests.length === 0) {
        container.innerHTML = `<div class="empty-friends">Burası boş görünüyor</div>`;
        return;
    }

    for (let req of requests) {
        const senderSnap = await getDoc(doc(db, "profiles", req.from));
        const senderData = senderSnap.exists() ? senderSnap.data() : { names: "Bilinmeyen", avatars: "/dosyalar/resimler/profiller/oyuncuPpVarsayılan.png" };

        const div = document.createElement("div");
        div.className = "request-item";

        const left = document.createElement("div");
        left.className = "request-left";
        const img = document.createElement("img");
        img.className = "friend-avatar";
        img.src = senderData.avatars || "/dosyalar/resimler/profiller/oyuncuPpVarsayılan.png";
        img.alt = "avatar";
        const nameSpan = document.createElement("div");
        nameSpan.className = "friend-name";
        nameSpan.textContent = senderData.names || senderData.username || 'Bilinmeyen';
        const ask = document.createElement("div");
        ask.style.color = '#ddd';
        ask.style.fontSize = '0.9rem';
        ask.textContent = 'İstek onaylansın mı?';

        left.appendChild(img);
        left.appendChild(nameSpan);
        left.appendChild(ask);

        const actions = document.createElement("div");
        actions.className = "request-actions";
        const acceptBtn = document.createElement("button");
        acceptBtn.className = "accept";
        acceptBtn.textContent = "Kabul";
        acceptBtn.addEventListener("click", async () => {
            await respondFriendRequest(currentUid, req.from, "accept");
            await showFriendsUid(currentUid);
            await loadIncomingRequests(currentUid);
        });

        const declineBtn = document.createElement("button");
        declineBtn.className = "decline";
        declineBtn.textContent = "Reddet";
        declineBtn.addEventListener("click", async () => {
            await respondFriendRequest(currentUid, req.from, "decline");
            await loadIncomingRequests(currentUid);
        });

        actions.appendChild(acceptBtn);
        actions.appendChild(declineBtn);

        div.appendChild(left);
        div.appendChild(actions);
        container.appendChild(div);
    }
}

// --- Game statistics: Balon Patlatmaca için kayıtlı skorları çek ve modalda göster
// --- Game statistics: Generic fetch and render for games
const GAME_MAP = {
    // key: { field: fieldNameInProfileDoc, label: displayName }
    balon: { field: 'balonPatlatmaca_scores', label: 'Balon Patlatmaca' },
    oyun2048: { field: 'oyun2048_scores', label: '2048' },
    desen: { field: 'desen_scores', label: 'Desen Bulma' }
};

async function fetchAndShowGameStats(targetUid, gameKey, ownerLabel = null) {
    const statsContainer = document.getElementById("statsContent");
    if (!statsContainer) return;
    statsContainer.textContent = 'Yükleniyor...';
    try {
        const meta = GAME_MAP[gameKey] || GAME_MAP['balon'];
        const userRef = doc(db, "profiles", targetUid);
        const snap = await getDoc(userRef);
        const data = snap.exists() ? snap.data() : {};
        const arr = Array.isArray(data[meta.field]) ? data[meta.field].slice() : [];
        if (arr.length === 0) {
            const msgWrap = document.createElement('div');
            msgWrap.className = 'empty-friends';
            // Use textContent to avoid injecting user-provided ownerLabel as HTML
            const ownerText = ownerLabel ? ` — ${ownerLabel}` : '';
            msgWrap.textContent = `Henüz ${meta.label}${ownerText} için oyun kaydı yok.`;
            // clear previous content then append
            statsContainer.innerHTML = '';
            statsContainer.appendChild(msgWrap);
            return;
        }
        // sort by timestamp desc
        arr.sort((a,b)=>{ const da = a.at ? new Date(a.at).getTime() : 0; const dbt = b.at ? new Date(b.at).getTime() : 0; return dbt - da; });

        // compute summary
        const scores = arr.map(e => Number(e.score) || 0);
        const best = Math.max(...scores);
        const avg = (scores.reduce((s,v)=>s+v,0)/scores.length).toFixed(2);

    // header (compact) + top summary + recent list
    statsContainer.innerHTML = ''; // clear first

    const headerWrap = document.createElement('div');
    headerWrap.style.marginBottom = '10px';
    headerWrap.style.color = '#fff';

    const titleEl = document.createElement('div');
    titleEl.style.fontWeight = '700';
    titleEl.style.color = '#fff';
    titleEl.style.marginBottom = '6px';
    titleEl.textContent = `Oyun: ${meta.label}`;
    headerWrap.appendChild(titleEl);

    if (ownerLabel) {
        const ownerDisplayEl = document.createElement('div');
        ownerDisplayEl.style.color = '#ccc';
        ownerDisplayEl.style.marginBottom = '6px';
        ownerDisplayEl.style.fontSize = '0.95rem';
        ownerDisplayEl.textContent = `Kullanıcı: ${ownerLabel}`; // textContent escapes
        headerWrap.appendChild(ownerDisplayEl);
    }

    const summaryEl = document.createElement('div');
    summaryEl.style.marginBottom = '10px';
    summaryEl.style.color = '#fff';
    summaryEl.innerHTML = `<strong>Toplam oyun:</strong> ${scores.length} &nbsp; <strong>En iyi:</strong> ${best} &nbsp; <strong>Ortalama:</strong> ${avg}`; // these are numbers/controlled values
    headerWrap.appendChild(summaryEl);

    statsContainer.appendChild(headerWrap);

    const listWrap = document.createElement('div');
    listWrap.style.maxHeight = '320px';
    listWrap.style.overflow = 'auto';
    listWrap.style.paddingRight = '6px';

    const ol = document.createElement('ol');
    ol.style.paddingLeft = '18px';
    ol.style.margin = '0';
    ol.style.color = '#ddd';

    const limit = 50;
    const list = arr.slice(0, limit);
    for (let e of list) {
        const li = document.createElement('li');
        li.style.marginBottom = '6px';
        li.style.color = '#ddd';
        const at = e.at ? new Date(e.at).toLocaleString('tr-TR') : '-';
        const sc = Number(e.score) || 0;
        // create text nodes so any user-provided data is escaped
        li.textContent = `${at} — `;
        const strong = document.createElement('strong');
        strong.style.color = '#fff';
        strong.textContent = sc.toString();
        li.appendChild(strong);
        ol.appendChild(li);
    }

    listWrap.appendChild(ol);
    statsContainer.appendChild(listWrap);
    } catch (err) {
        console.error(err);
        statsContainer.innerHTML = '<div class="empty-friends">İstatistikler yüklenirken hata oluştu.</div>';
    }
}

// Note: sentRequests tracking removed — we only store incoming friendRequests on receiver.

// Sayfa yüklendiğinde auth'ı bekle ve UI'yi başlat
onAuthStateChanged(auth, async (user) => {
    if (!user) return; // girişli değilse script.js zaten yönlendiriyor
    const currentUid = user.uid;
    // profil belgesi yoksa oluştur/alanları tamamla (kırılma olmasın diye)
    await ensureProfileExists(currentUid, user.email || 'Kullanıcı');

        // Kullanıcının küçük ID'sini göster
        const idElem = document.getElementById("userIdCode");
        try {
            const docSnap = await getDoc(doc(db, "profiles", currentUid));
            const data = docSnap.exists() ? docSnap.data() : null;
            if (idElem) idElem.textContent = data && data.userIdCode ? `ID: ${data.userIdCode}` : "ID: —";
        } catch (e) {
            console.error(e);
        }

        // Modal açma/kapatma ve ekleme butonları
        const openModalBtn = document.getElementById("openAddFriendBtn");
        const addModal = document.getElementById("addFriendModal");
        const closeModalBtn = document.getElementById("closeAddFriendBtn");
        const confirmAddBtn = document.getElementById("confirmAddFriendBtn");
        const friendInput = document.getElementById("friendIdInput");

        if (openModalBtn && addModal) {
            openModalBtn.addEventListener("click", () => {
                addModal.style.display = "flex";
            });
        }
        if (closeModalBtn && addModal) {
            closeModalBtn.addEventListener("click", () => {
                addModal.style.display = "none";
            });
        }
        // Kapama: arka plana tıklayınca kapat
        if (addModal) {
            addModal.addEventListener("click", (e) => {
                if (e.target === addModal) addModal.style.display = "none";
            });
        }

        if (confirmAddBtn) {
            confirmAddBtn.addEventListener("click", async () => {
                if (!friendInput) return alert("Arkadaş ID alanı bulunamadı.");
                const code = friendInput.value.trim();
                if (!code) return alert("Lütfen bir ID girin!");
                await sendFriendRequest(currentUid, code);
                friendInput.value = "";
                if (addModal) addModal.style.display = "none";
                await loadIncomingRequests(currentUid);
            });
        }

        // Gelen istekler modal açma/kapatma
        const showIncomingBtn = document.getElementById("showIncomingBtn");
        const incomingModal = document.getElementById("incomingModal");
        const closeIncomingBtn = document.getElementById("closeIncomingBtn");

        if (showIncomingBtn && incomingModal) {
            showIncomingBtn.addEventListener("click", async () => {
                incomingModal.style.display = "flex";
                await loadIncomingRequests(currentUid);
            });
        }
        if (closeIncomingBtn && incomingModal) {
            closeIncomingBtn.addEventListener("click", () => {
                incomingModal.style.display = "none";
            });
        }
        if (incomingModal) {
            incomingModal.addEventListener("click", (e) => {
                if (e.target === incomingModal) incomingModal.style.display = "none";
            });
        }

        // Game stats modal wiring
        const showStatsBtn = document.getElementById("showStatsBtn");
        const statsModal = document.getElementById("statsModal");
        const closeStatsBtn = document.getElementById("closeStatsBtn");
        if (showStatsBtn && statsModal) {
            showStatsBtn.addEventListener("click", async () => {
                // open for current user
                statsModal.dataset.targetUid = currentUid;
                statsModal.style.display = "flex";
                // ensure select exists
                const sel = document.getElementById('statsGameSelect');
                const gameKey = sel ? sel.value : 'balon';
                await fetchAndShowGameStats(currentUid, gameKey);
            });
        }
        if (closeStatsBtn && statsModal) {
            closeStatsBtn.addEventListener("click", () => { statsModal.style.display = "none"; });
        }
        if (statsModal) {
            statsModal.addEventListener("click", (e) => { if (e.target === statsModal) statsModal.style.display = "none"; });
        }
        // Re-fetch when select changes. Reads targetUid from statsModal.dataset if set (so we can view friends' stats)
        const statsSelect = document.getElementById('statsGameSelect');
        if (statsSelect) {
            statsSelect.addEventListener('change', async () => {
                const gameKey = statsSelect.value || 'balon';
                const target = (statsModal && statsModal.dataset && statsModal.dataset.targetUid) ? statsModal.dataset.targetUid : currentUid;
                // if viewing other's stats, try to supply their display name as ownerLabel
                let ownerLabel = null;
                if (statsModal && statsModal.dataset && statsModal.dataset.ownerLabel) ownerLabel = statsModal.dataset.ownerLabel;
                await fetchAndShowGameStats(target, gameKey, ownerLabel);
            });
        }

        // İlk yükleme
        await showFriendsUid(currentUid);
        // yüklemeleri hazırla (arka planda)
        await loadIncomingRequests(currentUid);

        // coin gösterimini güncelle
        const coinElem = document.getElementById('coinCount');
        async function refreshCoins(){
            try{
                const snap = await getDoc(doc(db,'profiles',currentUid));
                const data = snap.exists() ? snap.data() : {};
                const coins = Number((data && data.coins) || 0);
                if (coinElem) coinElem.textContent = coins;
            }catch(e){ console.error('coin fetch failed', e); }
        }
        refreshCoins();

        // Market modal: create markup dynamically and wire buy logic
        const existingMarket = document.getElementById('marketModal');
        if (!existingMarket) {
            const marketHtml = document.createElement('div');
            marketHtml.id = 'marketModal';
            marketHtml.style.cssText = 'display:none;position:fixed;left:0;top:0;width:100%;height:100%;background:rgba(0,0,0,0.6);justify-content:center;align-items:center;z-index:60;';
            marketHtml.innerHTML = `
            <div class="modal-body" style="background:#2b2b2b;padding:18px;border-radius:10px;width:520px;max-width:96%;text-align:left;">
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">
                <h3 style="margin:0;color:#fff;">Market</h3>
                <button id="closeMarketBtn" style="background:#ff4b4b;border:none;border-radius:8px;color:#fff;padding:6px 10px;cursor:pointer;">Kapat</button>
              </div>
              <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
                <div style="color:#ddd">Coin: <strong id="marketCoinDisplay" style="color:#ffd24a;margin-left:6px;">0</strong></div>
                <div style="color:#ccc;font-size:0.95rem;">Öğeler</div>
              </div>
              <div id="marketItems" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:12px;">
              </div>
            </div>`;
            document.body.appendChild(marketHtml);
        }

        // Open market button
        const openMarketBtn = document.getElementById('openMarketBtn');
        if (openMarketBtn) {
            openMarketBtn.addEventListener('click', async () => {
                const m = document.getElementById('marketModal');
                if (!m) return;
                m.style.display = 'flex';
                // update coin display
                const mc = document.getElementById('marketCoinDisplay');
                const snap = await getDoc(doc(db,'profiles',currentUid));
                const data = snap.exists() ? snap.data() : {};
                const coins = Number((data && data.coins) || 0);
                if (mc) mc.textContent = coins;
                if (coinElem) coinElem.textContent = coins;
                renderMarketItems(currentUid);
            });
        }

        // close market
        document.addEventListener('click', (e)=>{
            const target = e.target;
            if (target && target.id === 'closeMarketBtn') {
                const m = document.getElementById('marketModal');
                if (m) m.style.display = 'none';
            }
        });

        // helper: render market items
        async function renderMarketItems(uid){
            const container = document.getElementById('marketItems');
            if (!container) return;
            container.innerHTML = '';
            // get owned items to show status
            const snap = await getDoc(doc(db,'profiles',uid));
            const data = snap.exists() ? snap.data() : {};
            const owned = Array.isArray(data.ownedItems) ? data.ownedItems : [];
            const now = Date.now();
            for (const it of MARKET_ITEMS) {
                const card = document.createElement('div');
                card.style.cssText = 'background:#333;padding:10px;border-radius:8px;display:flex;flex-direction:column;align-items:center;gap:8px;';
                // Build card content safely using DOM APIs (avoid innerHTML with untrusted text)
                const img = document.createElement('img');
                img.src = it.image;
                img.alt = it.title || 'item';
                img.style.width = '84px';
                img.style.height = '84px';
                img.style.borderRadius = '8px';
                img.style.objectFit = 'cover';
                img.style.border = '2px solid rgba(255,255,255,0.04)';

                const titleDiv = document.createElement('div');
                titleDiv.style.color = '#fff';
                titleDiv.style.fontWeight = '700';
                titleDiv.textContent = it.title;

                const priceDiv = document.createElement('div');
                priceDiv.style.color = '#ffd24a';
                priceDiv.style.fontWeight = '700';
                priceDiv.textContent = `${it.price} ₵`;

                card.appendChild(img);
                card.appendChild(titleDiv);
                card.appendChild(priceDiv);
                const btn = document.createElement('button');
                btn.style.cssText = 'padding:6px 10px;border-radius:8px;border:none;cursor:pointer;font-weight:700;background:#2ecc71;color:#fff';
                // special handling for daily10 (can be claimed once per 24h)
                if (it.id === 'daily10') {
                    const last = (data && data.daily10LastPurchase) ? new Date(data.daily10LastPurchase).getTime() : 0;
                    const claimed = (now - last) < (24*60*60*1000);
                    btn.textContent = claimed ? 'Bugün alındı' : 'Günlük +10';
                    btn.disabled = claimed;
                    btn.addEventListener('click', async ()=>{
                        // recheck server state
                        const ref2 = doc(db,'profiles',uid);
                        const snap2 = await getDoc(ref2);
                        const d2 = snap2.exists() ? snap2.data() : {};
                        const last2 = d2.daily10LastPurchase ? new Date(d2.daily10LastPurchase).getTime() : 0;
                        if ((Date.now() - last2) < (24*60*60*1000)) { alert('Günlük ödül zaten alınmış.'); return; }
                        // grant 10 coins
                        try{
                            // Prefer atomic increment when available
                            await updateDoc(ref2, { coins: increment(10), daily10LastPurchase: new Date().toISOString() });
                            alert('10 coin kazanıldı!');
                            await renderMarketItems(uid);
                            return;
                        }catch(e){}
                        // Fallback: merge with calculated value (not atomic)
                        try{
                            const newCoins = Number((d2 && d2.coins) || 0) + 10;
                            await updateDoc(ref2, { coins: newCoins, daily10LastPurchase: new Date().toISOString() });
                            alert('10 coin kazanıldı!');
                        }catch(e){ console.error(e); alert('Ödül alınamadı.'); }
                        await renderMarketItems(uid);
                    });
                } else {
                    btn.textContent = owned.includes(it.id) ? 'Satın Alındı' : 'Satın Al';
                    btn.disabled = owned.includes(it.id);
                    btn.addEventListener('click', async ()=>{
                        await purchaseItem(uid, it);
                        await renderMarketItems(uid);
                        // refresh market coin display and sidebar coin
                        const mcd = document.getElementById('marketCoinDisplay');
                        const profSnap = await getDoc(doc(db,'profiles',uid));
                        const profData = profSnap.exists() ? profSnap.data() : {};
                        const newCoins = Number((profData && profData.coins) || 0);
                        if (mcd) mcd.textContent = newCoins;
                        if (coinElem) coinElem.textContent = newCoins;
                    });
                }
                card.appendChild(btn);
                container.appendChild(card);
            }
        }

        // purchase logic
        async function purchaseItem(uid, item){
            try{
                const ref = doc(db,'profiles',uid);
                const snap = await getDoc(ref);
                const data = snap.exists() ? snap.data() : {};
                const coins = Number((data && data.coins) || 0);
                if (coins < item.price) { alert('Yeterli coin yok'); return; }
                const newCoins = coins - item.price;
                // update coins and ownedItems; optionally set avatar
                const updates = { coins: newCoins, ownedItems: arrayUnion(item.id) };
                // if item is a profile picture, set avatars field
                if (item.id.startsWith('pp')) updates.avatars = item.image;
                await updateDoc(ref, updates);
                alert('Satın alma başarılı!');
            }catch(e){ console.error('purchase failed', e); alert('Satın alma sırasında hata oluştu.'); }
        }

        // Otomatik yenileme: her 20 saniyede bir arka planda listeleri güncelle
        setInterval(async () => {
            await showFriendsUid(currentUid);
            await loadIncomingRequests(currentUid);
        }, 20000);
});
