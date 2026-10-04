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

### Stage kareleri (kullanıcı, baştan sırayla)

| Stage | Dosya | Bölüm başında can / puan | Not |
| --- | --- | --- | --- |
| 1 | `user-stage-01b.jpg` | X 5 / 00000000 | Alt sıra çizgisiz G P B P B P B P G |
| 2 | `user-stage-02b.jpg` | X 5 / 00054000 | Orta bant kırmızı, alt bant sarı (çizgisiz) — giriş parıltısı yorumunu doğruluyor |
| 3 | `user-stage-03b.jpg` | X 5 / 00244800 | Spiral, "Stage 3" yazısıyla doğrulandı |
| 4 | `user-stage-04.jpg` | X 4 / 00513700 | Yeni harita: iki kule + alt sıra |

- Stage 4'ün üst sırası Stage 1–3'ün üst sırasından **bir sıra yukarıda**. Izgaranın satır 0'ı HUD'ın hemen altına alındı (`y0 = 73.5`); Stage 1–3 satır 1'den başlıyor.
- Stage 4 kuleleri ızgaraya göre çeyrek hücre kayık (c = 2.25 / 4.5, ayna 11.5 / 13.75). Karede satır başına birkaç piksellik dışa kayma var; ölçüm/görüntü hatası sayıldı.
- Puan farkları (Stage 1→2: 54000, 2→3: 190800, 3→4: 268900) tuğla sayısıyla açıklanamıyor; bonuslar/nesneler ayrıca incelenmeli.
| 5 | `user-stage-05.jpg` | X 5 / 00538200 | Elmas halka: sol çizgili lila 2'likler, sağ kırmızı/lila çizgili kareler, ortada metal kare |
| 6 | `user-stage-06.jpg` | X 4 / 00868800 | Köşe kareler, çizgili merdivenler, dört L'den iki halka, içte mavi kareler (çeyrek hücre kayık) |

- Stage 4 → 5 arasında can X 4 → X 5: bir ekstra can kazanılmış (nedeni bilinmiyor).
- Çizgili bloklar Stage 5/6'da oyun sırasında da (`0120.jpg`) çizgili görünüyor; bunlar gerçek blok türü. Stage 1/2'deki çizgi ise giriş parıltısıydı.
- İki farklı çizgili mor var: mavimsi lila (`purple-s`) ve koyu eflatun (`violet-s`, Stage 6 sol halka).
- `0120.jpg` Stage 5'e benziyor ama sol yay farklı (mavi ve turuncu kareler). Tuğlaların vurulunca renk değiştirip değiştirmediği henüz bilinmiyor.
| 7 | `user-stage-07.jpg` | X 2 / 01016300 | Çizgili eflatun/sarı basamaklar, yeşil dikey çiftler, kırmızı/mavi, metal L'ler ve kareler |
| 8 | `user-stage-08.jpg` | X 3 / 01118700 | Sağ üstte sarı/mavi kıvrım, yükselen merdiven, mavi ve sarı tam sıralar, yeşil kareler (68 blok) |
| 9 | `user-stage-09.jpg` | X 2 / 01296500 | Çizgili yeşil kareler; ortada ızgaraya oturmayan, simetrik iki sıra mor kare |
| 10 | (sohbette, dosyaya kaydedilemedi) | X 3 / 01442300 | Çizgili kırmızı dikey bloklarla "HUK" biçimi, metal ara parçalar |

- Stage 6→7'de can X 4 → X 2, 7→8'de X 2 → X 3, 9→10'da X 2 → X 3: oyun içinde ekstra can kazanılıyor.
- Ölçüm aracı: sol/sağ iç duvar kenarından ızgara aralığı (alan genişliği = 19 hücre) ve x0 (= iç kenar + 0.49 hücre), HUD'ın alt kenarından satır 0 bulunur; her satır ortasından parlak bölümler okunur. Stage 4 ve 6 ile doğrulandı.

## Kullanıcı videosu `birinci.mov` (15 sn ekran kaydı, uzun YouTube videosunun ~0:08–0:30 bölümü, Stage 1)

Kayıt YouTube oynatıcısının ekran görüntüsü olduğu için kareler tekrarlanıyor ve oynatıcı arayüzü görüntünün üstüne biniyor. Bu yüzden **top/çubuk hızı güvenilir ölçülemedi**. Puan sayacı ise kare kare izlendi:

| Bulgu | Kanıt | Güven |
| --- | --- | --- |
| Kırılan her tuğla **+1000** | 0→1000, 1100→2100, 2200→3200 … | yüksek |
| Top çubuğa her çarptığında **+100** | 1000→1100, 2100→2200, 3200→3300; artış top çubuktayken oluyor | yüksek |
| Baloncuk içindeki gümüş top yakalanınca **+10000** | 15800→25900, 34200→44200; baloncuk çubuğa değdiği karede | yüksek |
| Vurulan tuğla kısa süre **kırmızı** yanıyor, sonra yerinde iki **altın halka** çıkıp kayboluyor; gri **kırıntılar** aşağı saçılıyor | `video-break-rings.jpg` | yüksek |
| Baloncuklar kırılan bazı tuğlalardan düşüyor; hangi tuğladan düştüğü bilinmiyor | `video-bonus-bubble.jpg` | orta |
| Kahverengi gözlü **yaratıklar** üstten girip tuğlaların üzerinde dolaşıyor, bazıları tuğla üstünde küçük bir öbek bırakıyor. Topla etkileşimi görülmedi | `video-creature.jpg` | gözlem; işlev bilinmiyor |
| Stage 1 alt sıranın ortası (c10) oyun sırasında **yeşil**; "Stage 1" yazısında mor, `0010.jpg`'de kırmızı (vurulma anı) | k001 karesi | yüksek |

Uygulandı: +1000 / +100 / +10000 puanları, kırmızı vuruş + altın halka + kırıntı animasyonu, baloncuk bonusu (düşme olasılığı %12 varsayım). Yaratıklar henüz uygulanmadı.

## `videom_parca_01.mov` (79 sn, 4x; Stage 1 sonu → Stage 4 başı)

| Bulgu | Kanıt | Güven |
| --- | --- | --- |
| Bölüm girişi: tuğlalar koyu gri → gümüş çizgili → satır satır gerçek renk (önceki "çizgili Stage kareleri" bu animasyon) | `video-stage2-intro.jpg`, Stage 2/3/4 girişleri | yüksek |
| Sarı çekirdekli mavi baloncuk yakalanınca +10000 ve çubuk **turuncu lazer çubuğa** dönüşüyor; çift ışın kendiliğinden ve sürekli atılıyor, tuğla kırıyor; lazer bölüm sonuna kadar kalıyor | `video-laser-paddle.jpg`, 58300→70400 | yüksek |
| Koyu çekirdekli baloncuk yalnızca +10000 (Stage 3, 245900→256900, çubuk değişmedi) | | orta |
| Kırılan tuğlaların bir kısmından baloncuk düşüyor (Stage 2'de 46 tuğladan ~10) | | orta |
| Yaratık yok edildiğinde **+50000** ve kırmızı parçalar (303700→353700, 353800→403800, 405000→455000) | `video-creatures-50k.jpg` | yüksek |
| Yaratıklar üstten girip alan içinde dolaşıyor, tuğla üstlerine küçük kahverengi öbekler bırakıyor; Stage 3'te aynı anda 4 | | gözlem |
| Metal bloklar kırılmıyor, bölüm onlar dururken bitiyor (Stage 2) | | yüksek |
| Stage 3'te 2–3 turuncu parlayan top ve yukarı giden füze benzeri mermi görüldü; tetikleyen ödül belirsiz (uygulanmadı) | | düşük |
| Stage 3 sonunda top kaçınca X5 → X4 | | yüksek |

## `videom_parca_02.mov` (86 sn, 4x; Stage 5 sonu → Stage 8 başı)

| Bulgu | Kanıt | Güven |
| --- | --- | --- |
| Çizgili tuğlalar **iki vuruşta** kırılıyor: ilk vuruşta çizgiler gidip düz renge dönüyor (Stage 5 kırmızı kare, Stage 6 köşeler, Stage 7 mor sıra) | | yüksek |
| Stage 6 halkalarındaki mavi kareler **hareketli**: boşlukta sağa sola kayıyor, halka kırılınca alanda dolaşıp tuğlalara/duvarlara çarparak yön değiştiriyor | `video-stage-06-movers.jpg` | yüksek |
| Stage 7'de baloncuk yakalanınca X2 → X3 ve +11000: **ekstra can** veren baloncuk var (görünüşü ayırt edilemedi) | `video-stage-07-life.jpg` | orta |
| Metal bloklar kalırken bölüm bitiyor (Stage 5, 7) | | yüksek |
| Stage 8 yazısız başlangıç karesi: c11 r3'te çizgili kırmızı kare eksikti, eklendi (69 blok) | `video-stage-08-start.jpg` | yüksek |
| Stage 5 sonu/Stage 6'da turuncu parlayan toplar ve yukarı giden ateş/füze mermileri; tetikleyen ödül belirsiz (uygulanmadı) | | düşük |
| Can kayıpları: Stage 6'da X4 → X3 ve X3 → X2 (top kaçtı) | | yüksek |

## `videom_parca_03.mov` (81 sn, 4x; Stage 8 sonu → Stage 10 sonu) ve `videom_parca_04.mov` (12 sn; Stage 11 girişi)

| Bulgu | Kanıt | Güven |
| --- | --- | --- |
| Stage 9 mor kareleri kendi sıralarında **yatay kayıyor**; önceki "ızgaraya oturmayan konumlar" bu hareketten | `video-stage-09-start.jpg` ve ardışık kareler | yüksek |
| Stage 10 yazısız başlangıç karesi ölçümle birebir aynı (48 blok) | `video-stage-10-start.jpg` | yüksek |
| Çizgili kırmızı bloklar Stage 10'da da iki vuruşta kırılıyor (önce düz kırmızı) | | yüksek |
| Ekstra can tekrar görüldü: Stage 9'da X2 → X3, Stage 10'da X2 → X3 | | yüksek |
| Yaratık +50000 (Stage 10: 1481200 → 1531200) | | yüksek |
| Stage 11: mavi küçük kareler çapraz çizgiler halinde; başka yöne kayıyor olabilir — oyuna eklenmedi (ilk 10 bölüm kapsamı) | `video-stage-11-intro.jpg` | — |

## `trim_01`–`trim_10` (kullanıcı, uzun video 0.25x oynatılarak kaydedildi; Stage 1 → Stage 7 başı)

Uzun videoda "▶▶4x" etiketsiz bölümler 1x, etiketli bölümler 4x. 0.25x kayıtta etiketsiz bölüm gerçek hızın 1/4'ü, etiketli bölüm gerçek hız. Ölçümler 1264 px genişlikteki mantıksal alana çevrildi.

| Bulgu | Kanıt | Güven |
| --- | --- | --- |
| Top hızı Stage 1 başında **~134 px/s** (kare kare izleme, 1.6 sn boyunca düz yol) | trim_01 0:30–0:42 | yüksek |
| Top hızı Stage 4'te **~187 px/s** → bölüm başına ~+15 px/s | trim_05 0:31 (4x bölüm) | orta |
| Çubuk hızı en fazla **~300–370 px/s** | trim_05 0:30–0:50 | orta |
| **Stage 4 kuleleri birlikte kayıyor**: ortada birleşip duvarlara açılıyor, ~5.9 sn döngü, sıralar hafif dalgalı. Önceki "çeyrek hücre kayık" ölçüm bu hareketten | `trim-stage-04-towers-meet.jpg` | yüksek |
| Stage 1 alt sıra **G P B P B P B P G** (ortası mor); `birinci.mov`'dan çıkan "yeşil" düzeltmesi yanlıştı, geri alındı | `trim-stage-01-clean.jpg` | yüksek |
| Baloncuklar yavaş düşüyor (~110 px/s) | | orta |
| Menü öncesi cihaz menüsü: "Game → ExBlock / Poker / BricksLay / Bomb Hexa" | trim_01 0:00 | yüksek |
| Turuncu parlak top + hızlı alev mermisi (tuğla kırıyor, +1000 / L için +2100); tetikleyen ödül görülmedi → **uygulanmadı** | trim_09 1:28–1:52 | düşük |

## `trim_11`–`trim_23` (0.25x kayıt; Stage 7 sonu → Stage 14 başı)

| Bulgu | Kanıt | Güven |
| --- | --- | --- |
| Stage 11: mavi kareler 4 sütun aralıklı çapraz çizgilerle başlıyor; oyun sırasında hepsi yatayda kayıyor (çiftler birbirine yaklaşıp uzaklaşıyor). Oyunda yatay seken kareler olarak yaklaşık uygulandı | `trim-stage-11-intro.jpg`, trim_18 | orta |
| Stage 12: metal iskelet (6 dikey, 5 yatay, 4 kare), sarı/çizgili lila/sarı üst sıra, çizgili kırmızı orta; 4 sarı kare serbest dolaşıyor | `trim-stage-12-start.jpg` | yüksek |
| Stage 13: turuncu 2×2, mor sütunlu piramit (çizgili kırmızı tepe, çizgili yeşil/lila iç), metal basamaklar, yeşil kaktüs, sarı ve çizgili lila tam sıralar (72 blok) | `trim-stage-13-start.jpg` | yüksek |
| Stage 14: iki yanda çizgili basamak, ortada küçük piramit, iki kayan mor parça, altta iki karışık tam sıra | `trim-stage-14-start.jpg` | yüksek (yalnız başlangıç) |
| Stage 14'te can X1 → X0 düştü, kayıt Continue ile 01979000 puanla yeni bir haritaya geçiyor (kullanıcı kaydı) | trim_23 0:36 | gözlem |

## `kayit_trim_01`–`kayit_trim_24` (0.25x kayıt; Stage 14 → Stage 22 girişi)

`kayit_trim_20` iki kez gönderildi; iki dosya birebir aynı.

| Bulgu | Kanıt | Güven |
| --- | --- | --- |
| **Continue = bölüm seçimi**: oyun bitince Continue, "Select Stage Using V+/V- · Press OK to Start Game" ekranını açıyor; ulaşılan bölümler arasında seçiliyor, seçilen bölüm 00000000 puan ve X5 ile başlıyor | `kayit-continue-select.jpg`, kayit_trim_13–14 | yüksek |
| Stage 15: kırmızı çizgili yan duvarlar arasında yeşil çerçeve, mavi iç halka, ortada sarı; metal parçalar | `kayit-stage-15-start.jpg` | yüksek |
| Stage 16: yeşil kenarlı kırmızı piramit, metal pencereler, altta mavi ve çizgili mor/mavi sıra | `kayit-stage-16-start.jpg` | yüksek |
| Stage 17: çizgili kenarlı kırmızı kalp ve mavi kareli kalp çizgisi | `kayit-stage-17-start.jpg` | orta-yüksek |
| Stage 18: metal kemerli "robot yüz", çizgili lila sütunlar, çizgili kırmızı taban | `kayit-stage-18-start.jpg` | orta |
| Stage 19: yeşil ve çizgili lila tek sıralar, dikey metal eksen, kırmızı + lila alt sıralar | `kayit-stage-19-start.jpg` | yüksek |
| Stage 20: kırmızı kanatlar, sarı U içinde çizgili yeşil, yanlarda kayık kırmızı köşeli parçalar, mavi + metal alt | `kayit-stage-20-start.jpg` | orta |
| Stage 21: çizgili lila elmas, ortasından geçen geniş mavi kuşak | `kayit-stage-21-start.jpg` | yüksek |
| Stage 22: yalnızca giriş görüldü (yazı haritayı kapatıyor) → eklenmedi | `kayit-stage-22-intro.jpg` | — |

## Kullanıcının hatırladıkları (oyunu oynamış biri olarak)

- Yukarıdan **3'lü top** veren ödül düşüyor → uygulandı: her uçan toptan ±20° açıyla iki top daha çıkar.
- **Genişlik** ödülü var → uygulandı: çubuk 194'ten 290'a genişler; can kaybı veya bölüm sonunda normale döner (süre varsayım).
- Lazer ("ateş") ışınları orijinalde daha kalın ve etkili → ışınlar kalın, parlak ve uzun izli yapıldı.
- Baloncuk görünüşleri (3 beyaz nokta, yeşil çubuk simgesi, pembe can) varsayım; orijinal simgeler henüz eşleştirilmedi.
- **Ateş topu** (kullanıcı + trim_09 1:20–1:32): büyük sarı/turuncu top, kırılan bir tuğlanın yerinden çıkıyor (aynı karede altın halkalar, puan +1000; baloncuk yakalanmadı). Kullanıcıya göre tuğlaların içinden geçerek kırıyor, normal toptan çok daha hızlı ve normal top kaybolsa bile ateş topu varken oyun sürüyor → uygulandı. Çıkma olasılığı (%5), hızı (2.2×) ve metalden sekmesi varsayım.
- Kullanıcının ödül listesi: palet uzatma, palet **kısaltma** (ceza), çoklu top, lazer, top **yavaşlatma / hızlandırma** → hepsi uygulandı. Kısaltma 194→130, yavaşlatma ×0.7, hızlandırma ×1.4; bu değerler ve düşme oranları varsayım. Etkiler can kaybında sıfırlanıyor (varsayım).
