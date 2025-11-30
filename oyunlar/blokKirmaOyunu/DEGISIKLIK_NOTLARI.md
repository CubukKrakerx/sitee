⚙️ BlokKirmaOyunu - Değişiklik Notları

Yaptığım düzeltmeler ve küçük geliştirmeler (oyun akışı bozulmadan):

1) Tuğla aralığı (brickPadding) küçültüldü
   - Eskiden 15 px olan tuğla boşluğu 5 px yapıldı.
   - Neden: 15 px bazı ekranlarda toplam tuğla genişliğinin canvas'tan taşmasına yol açıyordu; bu da tuğla düzeninin görünmesini engelliyordu.

2) Boş seviyelerin otomatik temizlenmesi engellendi
   - Önceden level deseni hiç tuğla içermiyorsa oyun anında seviye bitmiş sayılabiliyordu.
   - Şimdi sadece currentLevelBricks > 0 olduğunda ve tüm aktif tuğlalar kırıldığında seviye temizlenir.

3) Paddle-top çarpışması geliştirildi (küçük kontrol iyileştirmesi)
   - Top paddle'e çarptığında yatay hız (dx), topun paddle üzerindeki çarpma noktasına göre hafifçe ayarlanır.
   - Bu, oyuncuya topun yönünü daha iyi kontrol etme imkânı verir.
   - Topun yatay hızını sınırlamak için maksimum hız (maxSpeed = 6) getirildi; böylece oynanış beklenmedik şekilde hızlanmaz.

Test ve doğrulama önerileri
- Dosya: `oyunlar/blokKirmaOyunu/blokKirmaOyunu.html`
- Yerel ortamda dosyayı tarayıcıda açıp (ör. Chrome/Firefox) şu senaryoları kontrol edin:
  • Bölüm 1-3'te tuğla düzenleri düzgün gözükmeli (taşma olmamalı).
  • Boş desenli bir level varsa (ör. test amaçlı status=0 tüm tuğlalar) oyun otomatik olarak seviye atlamamalı.
  • Paddle'in köşelerine bilerek çarpma yaparak topun yatay hızının hafifçe değiştiğini gözlemleyin, fakat hız aşırı artmamalı.

Eğer isterseniz devamını getirebilirim:
- Mobil/touch için paddle sürükleme desteği ekleyebilirim.
4) Mobil uyumluluk ve sürükleme (mouse/touch) eklendi
   - Canvas üzerindeki dokunma ve fare hareketleri paddle'i kontrol eder. canvas ile CSS boyutu farklıysa iç koordinatlara dönüştürme uygulanır.
   - Touch hareket sırasında sayfanın kayması engellenir.

6) Kontrol sadece harita içindeyken çalışır
   - Fare veya dokunma girişleri artık yalnızca `canvas` öğesinin sınırları içindeyken paddle'i etkiler.
   - Bu sayede fare veya parmak ekranın oyun dışı alanındayken paddle yanlışlıkla yer değiştirmez.

5) Bölümler rastgele seçiliyor
   - Her seviye temizlendiğinde bir sonraki seviye rastgele seçilir (aynı seviye birkaç kez art arda gelmemesi için koruma var).
   - Eğer belirlenen template (1-3) yoksa fallback olarak seviyeye bağlı oynanabilir rastgele bir desen üretilir, böylece boş seviye oluşmaz.
   - Oyunda kaç seviye temizlendiği takip edilerek maxLevel kadar seviye temizlendiğinde oyun kazanılır.
- Ek seviyeler/desenler ekleyerek ilerleme sistemi geliştirebilirim.
 - İsterseniz dokunmatik için seviye seçici ve mobil UI iyileştirmeleri ekleyebilirim.

İsterseniz şimdi tarayıcıda birkaç adımla manuel test için yönlendirme verebilirim veya başka bir geliştirme talebiniz varsa uygulayayım.