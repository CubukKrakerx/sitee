const facts = [
    "Kaplumbağalar 150 yıl yaşayabilir.",
    "Ahtapotların üç kalbi vardır.",
    "Bal arıları matematiksel hesap yapabilir.",
    "Kirpilerin ter bezleri yoktur.",
    "Deniz yıldızları kafaları olmadan yaşayabilir.",
    "Dünya, yaklaşık olarak 6,588,000,000,000,000,000,000,000 ton ağırlığındadır.",
    "Venüs gezegeni, Güneş'e en yakın ikinci gezegendir ve saat yönünde dönen tek gezegendir.",
    "Oxford sözlüğüne göre, en uzun İngilizce kelime bir hastalık ismi olan ''pneumonoultramicroscopicsilicovolcanoconiosis'' dir.",
    "Dünyadaki en eski ağaç, yaklaşık 5,000 yaşında olan bir bristlecone çamıdır.",
    "İnsan vücudunda yaklaşık 60,000 mil (96,560 km) uzunluğunda kan damarları bulunmaktadır.",
    "Dünyanın en büyük çiçeği, Rafflesia arnoldii, 1 metre çapında ve 11 kilogram ağırlığında olabilir.",
    "Kutup ayıları, kürkleri şeffaftır ve derileri siyahtır.",
    "Dünyanın en hızlı hayvanı, saatte 240 mil (386 km/s) hızla uçabilen peregrine şahini.",
    "Dünyadaki en büyük canlı organizma, Oregon'da bulunan bir mantar kolonisi olup, yaklaşık 3.4 mil (5.5 km) genişliğindedir.",
    "İnsan beynindeki nöron sayısı, yaklaşık 86 milyar civarındadır.",
    "Dünyanın en derin noktası, Mariana Çukuru'nda bulunan Challenger Deep olup, yaklaşık 36,070 feet (10,994 metre) derinliğindedir.",
    "Dünyadaki en büyük çöl, Antarktika'dır.",
    "Dünyanın en büyük hayvanı, mavi balinadır ve ağırlığı 200 tonun üzerindedir.",
    "Dünyadaki en uzun nehir, Nil Nehri olup, yaklaşık 4,135 mil (6,650 km) uzunluğundadır.",
    "Dünyadaki en büyük ada, Grönland olup, yaklaşık 2.16 milyon km² yüzölçümüne sahiptir.",
    "Dünyadaki en büyük göl, Hazar Denizi olup, yaklaşık 371,000 km² yüzölçümüne sahiptir.",
    "futboldaki en garip olaylardan biri, 1962 Dünya Kupası'nda yaşandı. İngiltere ile Şili arasında oynanan maçta, Şili kalecisi Roberto Rojas, sahaya atılan bir ışık çubuğunun kendisini yaraladığı iddiasıyla yere yattı. Ancak yapılan incelemeler sonucunda, Rojas'ın kendini bıçakla yaraladığı ortaya çıktı. Bu olay sonucunda Rojas, ömür boyu futboldan men edildi.",
    "Dünyadaki en büyük volkan, Hawaii'deki Mauna Loa'dır ve deniz seviyesinden 13,681 feet (4,170 metre) yüksekliğe sahiptir.",
    "Dünyadaki en büyük mercan resifi, Büyük Set Resifi olup, yaklaşık 2,300 km uzunluğundadır.",
    "Dünyadaki en büyük buzdağı, 1958 yılında Antarktika'da kopan B-15 buzdağı olup, yaklaşık 295 km uzunluğunda ve 37 km genişliğindeydi.",
    "futboldaki en hızlı gol, 2002 yılında Hakan Şükür tarafından atıldı. Türkiye ile Güney Kore arasında oynanan maçta, Şükür, maçın başlamasından sadece 11 saniye sonra golü kaydetti.",
    "basketboldaki en yüksek skorlu maç, 1983 yılında Detroit Pistons ile Denver Nuggets arasında oynandı. Maç, 186-184 skorla Nuggets'ın galibiyetiyle sonuçlandı ve toplamda 370 sayı atıldı.",
    "yunuslar, isimlerini tanıyabilir ve birbirlerine isimleriyle seslenebilirler.",
    "kaplumbağalar, nefes almadan 5 saate kadar su altında kalabilirler.",
    "kaplmbağalar dünyanın en eski canlılarından biridir ve 100 yıldan fazla yaşayabilirler.",
    "kaplumbağalar, vücut sıcaklıklarını çevrelerine göre ayarlayabilirler.",
    "kaplumbağalar, yön bulma yetenekleri sayesinde binlerce kilometre yol kat edebilirler.",
    "kaplumbağalar, dişleri yerine sert gagalarıyla beslenirler.",
    "kaplumbağalar, su altında uzun süre kalabilmek için oksijeni depolayabilirler.",
    "kaplumbağalar, şok emici kabukları sayesinde düşmelere karşı korunurlar.",
    "Bir kerevizi yemek için harcanan kalori, kerevizin kendi kalorisinden daha fazladır.",
    "Florida eyaleti İngiltere'den büyüktür.",
    "Dünyanın en uzun yer ismi, Yeni Zelanda'da bulunan 'Taumatawhakatangihangakoauauotamateaturipukakapikimaungahoronukupokaiwhenuakitanatahu' adlı tepedir.",
    "Dünyanın en büyük kar tanesi, 1887 yılında Montana'da ölçülmüş ve çapı 38 cm, kalınlığı ise 20 cm olarak kaydedilmiştir.",
    "Dünyanın en eski üniversitesi, 859 yılında Fas'ta kurulan Al-Qarawiyyin Üniversitesi'dir.",
    "Dünyanın en büyük pizza dilimi, 2012 yılında Norveç'te yapılmış ve 1,260 metrekarelik bir alana sahip olmuştur.",
    "Dünyanın en uzun köprüsü, Çin'de bulunan Danyang-Kunshan Büyük Köprüsü olup, uzunluğu 164.8 kilometredir.",
    "Dünyanın en büyük kütüphanesi, ABD'deki Kongre Kütüphanesi olup, yaklaşık 170 milyon öğeye sahiptir.",
    "bi insanda yaklaşık 0.2 mil (0.32 km) saç teli bulunmaktadır.",
    "insan vücudundaki en güçlü kas, çene kasıdır.",
    "insan kalbi, günde yaklaşık 100,000 kez atar.",
    "insan beyni, yaklaşık 2.5 petabayt (2.5 milyon gigabayt) bilgi depolayabilir.",
    "insan vücudundaki en büyük organ, deridir.",
    "insan vücudundaki en küçük kemik, kulaktaki üzengi kemiğidir.",
    "insan vücudundaki en uzun kemik, uyluk kemiğidir.",
    "lidya kraliçesi artemisia, savaşta atın üzerine binerek savaşan ilk kadın liderlerden biridir.",
    "hz. muhammed'in (s.a.v) en sevdiği yiyecek hurmadır.",
    "osmanlı padişahı iv. mehmed, tahta çıktığında sadece 6 yaşındaydı.",
    "fatih sultan mehmed, 21 yaşında istanbul'u fethetti.",
    "kanuni sultan süleyman, 46 yıl boyunca osmanlı tahtında kaldı.",
    "osmanlı imparatorluğu, 600 yıl boyunca varlığını sürdürdü.",
    "cehennem kelimesi arapça kökenlidir ve 'yanmak' anlamına gelir.",
    "dünyanın en büyük çölü antarktika'dır.",
    "dünyadaki en uzun nehir nil nehridir.",
    "dünyadaki en büyük ada grönland'dır.",
    "cennet kelimesi arapça kökenlidir ve 'bahçe' anlamına gelir.",
    "ahiret kelimesi arapça kökenlidir ve 'sonraki hayat' anlamına gelir.",
    "timsahlar, dillerini dışarı çıkaramazlar.",
    "Dünyada öyle bir ada var ki yalnızca kuşlar yaşıyor – İnsanlar giremez, çünkü ada tamamen kuş kolonileri tarafından işgal edilmiş durumda.",
    "Uzayda astronotların boyu 5 cm kadar uzayabilir, omurlar arası boşluk açıldığı için.",
    "Kelebeklerin tat alma tomurcukları ayaklarındadır.",
    "Köpek balıkları, hücreleri hızlı onarır ve anormal hücreleri yok eden güçlü bağışıklıkları sayesinde neredeyse kanser geliştirmez."
];

const factText = document.getElementById("fact");
const newFactBtn = document.getElementById("newFactBtn");

newFactBtn.addEventListener("click", () => {
    const randomIndex = Math.floor(Math.random() * facts.length);
    factText.textContent = facts[randomIndex];
});

const emojiContainer = document.getElementById("emoji-container");

// 5 farklı emoji
const emojis = ["⭐","🌟"];

// Şu anki kullanılacak emoji
let currentEmoji = emojis[0];

// Her 300ms bir emoji oluştur
function createEmoji() {
    const span = document.createElement("span");
    span.classList.add("emoji");
    span.textContent = currentEmoji;             // sadece tek emoji tipi
    span.style.left = Math.random() * 100 + "vw";
    span.style.fontSize = (20 + Math.random() * 30) + "px";
    span.style.animationDuration = (3 + Math.random() * 3) + "s";
    emojiContainer.appendChild(span);

    setTimeout(() => span.remove(), 6000);
}

setInterval(createEmoji, 300);

// Butona basınca yeni emoji seç
newFactBtn.addEventListener("click", () => {
    // Yeni emoji seç (mevcut emoji ile aynı olmasın)
    let newEmoji;
    do {
        newEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    } while (newEmoji === currentEmoji);

    currentEmoji = newEmoji;
});
