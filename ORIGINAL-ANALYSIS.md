# ExBlock — orijinal sürüm analizi

Referans sürüm: Topfield TF3000FEi cihazındaki oyun. Next/NextStar ile aynı sürüm olduğu doğrulanmadı.

Birincil kaynaklar:
- https://www.youtube.com/watch?v=M_CgQu-YoA0 — orijinal cihazdan 2:39 oynanış kaydı.
- https://www.youtube.com/watch?v=J6PVIV2x7OM — 59 dakikalık, 4x hızlandırılmış tamamlanma kaydı. Açıklama bitişi 58:09 olarak gösteriyor.

Doğrudan gözlenenler:
- Ana menü: ExBlock başlığı; New Game, Continue, Exit seçenekleri; beyaz seçim çerçevesi ve sarı yazılar.
- Arka plan yalnızca düz yıldız noktaları değil: siyah uzayda mor ve yeşil nebula görünümü.
- Oyun alanının iki yanında mor/mavi, açık metalik kenarlı duvarlar var.
- Üstte çubuk simgesi, X ve can sayısı; sağda SCORE ve sekiz basamaklı puan alanı.
- 0:19 kısa video karesinde can alanı X5, puan 00003200. Bu devam edilmiş bir oyun olabilir; başlangıç canı sonucu çıkarılamaz.
- Çubuk yeşil, uçları sarı/kırmızı; top beyaz/parlak.
- Tuğlalar mavi, mor, yeşil, sarı, turuncu; kabartma kenarlı. Dizilim tek tip dolu dikdörtgen değil, boşluklu ve kademeli.

Henüz doğrulanmayanlar:
- Toplam bölüm sayısı ve her bölümün eksiksiz haritası.
- Başlangıç canı, tuğla başına puan, bölüm bonusları.
- Top hızları, çarpışma açısı, kumanda tekrar hızı ve güçlendirmeler.
- Continue seçeneğinin cihaz kapandıktan sonraki davranışı.

İlk prototipin 8 bölümü, 3 canı, tuğla başına 10 puanı ve bölüm geçiş bonusu orijinalden alınmamıştır. Birebir sürümde kanıt olmadan korunmamalıdır.

Uzun kayıttan ek gözlemler:
- Yaklaşık 58:21 civarında geçiş ekranında açıkça “Stage 15” yazısı gözlendi. En az 15 aşama olduğu doğrulanıyor; toplam sayı veya döngü yapısı henüz kanıtlanmıyor.
- 58:09 civarında metalik bloklar, birden fazla top ve ek hareketli nesneler görünüyor. Nesnelerin işlevi ve metal blokların dayanıklılığı ayrıca incelenmeli.
- Kaydın hızlandırılmış olması nedeniyle bu videodan doğrudan normal top hızı çıkarılamaz. Hız ölçümü kısa, normal oynanış videosundan yapılmalı.
- Uzun videonun başlığındaki “tamamlanma” ifadesi tek başına oyunun son bölümünü kanıtlamaz; bitiş davranışı ayrıca doğrulanmalıdır.

## Araştırmanın durdurulduğu nokta — 4 Ekim 2026

Kullanıcı kullanım limiti azaldığı için burada durulmasını, yöntemin ve kalan işlerin README'ye kaydedilmesini istedi. Tam devam kaydı `README.md` içindedir.

Ek gözlemler:
- İlk harita üstte 2 turuncu, 3 mavi, 4 sarı, 5 yeşil tuğlalı kademeler; altta ikişer hücre yüksekliği aralıklı iki tam sıra içeriyor. İlk görüntüde toplam 32 tuğla sayılabiliyor. Bu sayım ilk haritayla sınırlı.
- 00:35 karesinde ikinci harita üç bant halinde dikey tuğlalardan oluşuyor. Üst bant 18, orta 16, alt 12 dikey konum içeriyor; her bandın iki ucunda metal görünümlü bloklar var.
- 00:55 karesinde iç içe kıvrımlı renkli düzen ve L biçimli tuğlalar görünüyor. Tam başlangıç haritası olarak kullanılmadan önce eksik/kırılmış parçalar kontrol edilmeli.
- Çoklu top doğrudan görüldü. Daha sonraki karelerde normal yeşil çubuktan farklı bir çubuk ve yukarı uzanan çift atış izleri görüldü; nesne→etki eşlemesi tamamlanmadı.
- Can göstergesi örneklerde X5, X7, X3 ve son geçişte X0 değerlerini gösteriyor; başlangıç/ek can/kaybetme kuralları henüz tam çıkarılmadı.
- `reference-frames/stage-15.jpg` yaklaşık 58:17'de Stage 15 yazısını doğruluyor ve ilk haritaya benzeyen bir düzen gösteriyor. Tekrarın nedenini veya toplam bölüm sayısını kanıtlamıyor.

Tarama ilk yaklaşık 8 dakikada aralıklı örnekler ve sonrasında birkaç kontrol karesiyle sınırlı kaldı. Her bölümün eksiksiz haritası henüz çıkarılmadı. Seri tarama sırasında yanlış zamanlı veya kırpılmış görüntüler oluştu; bu denemeler `unverified-captures/` klasörüne taşınıp Git kapsamından çıkarıldı. Teslim edilen kareler dahi bir bölümü kısmen temizlenmiş halde gösterebilir; tam bölüm haritası yerine otomatik kullanılmamalı.

## Kullanıcı ekran görüntüleri ve harita ölçümü — 4 Ekim 2026 (2. oturum)

Bu oturumdan YouTube'a erişilemedi (önce ağ politikası, sonra Google bot doğrulaması). Kullanıcı kendi bilgisayarından dört kare gönderdi; `reference-frames/user-*.jpg` olarak kaydedildi. Videodaki zamanları belirtilmedi.

| Dosya | Görünen | Güven |
| --- | --- | --- |
| `user-menu.jpg` | Ana menü: ateş dokulu "ExBlock" başlığı, New Game (gri-beyaz çerçeveyle seçili), Continue, Exit. **Menüde üst bilgi çubuğu yok.** | yüksek |
| `user-stage-01.jpg` | "Stage 1" yazısı, harita sağlam | yüksek |
| `user-stage-02.jpg` | "Stage 2" yazısı, harita sağlam | yüksek |
| `user-stage-03-start.jpg` | Spiral harita, top çubukta; numara görünmüyor, sıradan Stage 3 kabul edildi | orta-yüksek |

Ölçüm yöntemi: oyun alanı 18 sütunluk yarım-tuğla ızgarası. 1264 px genişliğe ölçeklenmiş karede hücre 65 × 63.5 px, ilk hücre x=49, y=137. Normal tuğla 2×1, dikey tuğla 1×2, L parçaları üç hücre. Haritalar `src/levels.js` içinde, sayım ve çakışma testi `tests/levels.test.js` içinde.

Çözülmemiş fark (önemli):
- Stage 1 alt sırası kullanıcı karesinde `G, mor-çizgili, mavi-çizgili, … , G`; uzun videonun `0010.jpg` karesinde ise çizgisiz `G P B P B R B P G` (ortada kırmızı).
- Stage 2 orta bandı kullanıcı karesinde gümüş çizgili, alt bant hafif çizgili sarı; `0035.jpg` karesinde orta bant düz kırmızı, alt bant düz sarı.
- Olası açıklamalar: (a) kareler farklı kayıtlardan/sürümlerden, (b) çizgili bloklar ilk vuruşta renk değiştiriyor ya da altındaki rengi gösteriyor, (c) parıltı animasyonu. Hiçbiri doğrulanmadı. Kullanıcı karelerinin hangi videodan ve hangi zamandan alındığı öğrenilmeli. Oyunda şimdilik "Stage N" yazılı kareler esas alındı.
- Spiral iki ayrı karede (`0055.jpg`, `user-stage-03-start.jpg`) birebir aynı; bu harita güvenilir.

Güncelleme — kullanıcının ikinci Stage 1 karesi (`user-stage-01b.jpg`, puan 0, X 5): alt sıra **çizgisiz** `G P B P B P B P G`. Renkler `user-stage-01.jpg` ile aynı, yalnızca çizgiler yok. Bu yüzden "Stage N" yazısı sırasında görülen çizgi/gümüş görünüm büyük olasılıkla **bölüm girişindeki parıltı animasyonu**; tuğla türü değil (orta güven). Stage 2'nin gümüş orta bandı da aynı şekilde yorumlandı ve renkler `0035.jpg`'den alındı (orta bant kırmızı, alt bant sarı). Spiraldeki yeşil çizgili ve `0550.jpg`'deki kırmızı/mor çizgili bloklar oyun sırasında da görüldüğü için gerçek özel bloklar kabul edildi. `0010.jpg`'deki ortadaki kırmızı tuğla hâlâ açıklanamadı.
