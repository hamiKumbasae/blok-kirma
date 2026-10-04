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
