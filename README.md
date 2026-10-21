# BlokYıldızı

> **Not:** Bu proje, Topfield uydu alıcılarındaki *ExBlock* oyunundan esinlenen, kâr amacı gütmeyen bağımsız bir hayran yapımıdır. Orijinal oyunun kodu, görselleri veya sesleri kullanılmamıştır; tüm kod ve çizimler sıfırdan yazılmıştır. Topfield ve ExBlock adları sahiplerine aittir; bu proje onlarla bağlantılı değildir ve onlar tarafından onaylanmamıştır. Hak sahiplerinin talebi olursa içerik kaldırılır.

**▶ Oyna:** https://hamikumbasae.github.io/exblock/

Bağlantı, depo ayarlarında GitHub Pages açıkken çalışır (Settings → Pages → Source: GitHub Actions; gizli depoda ücretli plan gerekir).

Amaç: Çocuklukta televizyon/uydu alıcısında kumandayla oynanan **ExBlock** oyununu ayrı bir proje olarak, önce orijinaline mümkün olduğunca sadık biçimde yeniden yapmak. Kullanıcı mevcut `tugla-kirma` oyununa eklenmesini istemedi.

**Durum: Çalışan bir prototip ve kısmi video analizi var. Birebir yeniden yapım henüz tamamlanmadı.** Kullanım limiti nedeniyle 4 Ekim 2026 tarihinde araştırma durdurulup bu devam kaydı hazırlandı. Sıradaki Codex bu dosyadan devam etmeli; tüm bölümlerin incelendiğini varsaymamalı.

## Çalıştırma

Harici paket, derleme veya sunucu tarafı kod gerekmiyor. `index.html` tarayıcıda açılabilir. Yerel sunucu için proje klasöründe:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Ardından http://127.0.0.1:8765/ adresini aç.

Kontroller: sol/sağ ok veya A/D; Boşluk/Enter topu atar; P duraklatır. Dokunmatik alanda sürükleme, yön düğmeleri ve yeniden başlatma da var.

## Mevcut kod ne yapıyor?

`index.html` tek dosyalık HTML/CSS/Canvas/JavaScript oyunu. Oyun alanı 720×540; çubuk, top, tuğla çarpışmaları, can kaybı, bölüm geçişi, puan ve duraklatma çalışıyor. Fizik 1/240 saniyelik sabit adımlarla ilerliyor. Pencere odağı kaybolunca oyun duraklıyor. Önceki çalışmada JavaScript sözdizimi ve tarayıcıda başlatma/duraklatma/sıfırlama kontrol edildi.

**Bu değerler orijinalden ölçülmedi:** 8 üretilmiş bölüm, 3 başlangıç canı, tuğla başına 10 puan, bölüm başına 100 bonus, top/çubuk hızları ve çarpışma açıları. Bunları orijinalin kuralları diye kullanma. Şu anda güçlendirme, çoklu top, ateş eden çubuk, metal blok davranışı, özgün bölüm haritaları, özgün menü, ses ve Continue kaydı yok. Görseller de yaklaşık bir yorum.

## Referanslar

- [Uzun oynanış kaydı, 59:48, 4× hızlandırılmış](https://www.youtube.com/watch?v=J6PVIV2x7OM): `Topfield ExBlock full complete with ending 4x timelapse (also world record speedrun)`, skil3z. Açıklama 58:09'u bitiş olarak belirtiyor; bu ifade tek başına toplam bölüm sayısını kanıtlamıyor.
- [Normal hızdaki TF3000FEi oynanışı](https://www.youtube.com/watch?v=M_CgQu-YoA0): `ExBlock Gameplay - built in game for Topfield TF3000FEi TV tuner`, Cordylus. Fizik ve kumanda hareketi ölçümü için bu kayıt kullanılmalı.
- [Oyunun tanınmasını sağlayan forum](https://techolay.net/sosyal/konu/tuplu-vestel-televizyonda-oynadigim-breakout-benzeri-oyun.124398/).

Kullanıcı Next/NextStar olabileceğini hatırlıyor. Bulunan kayıt Topfield sürümü; cihazların aynı oyun/sürümü kullandığı doğrulanmadı.

## Kanıtlanan bulgular ve ekran görüntüleri

Ayrıntılar [ORIGINAL-ANALYSIS.md](ORIGINAL-ANALYSIS.md) içinde. `reference-frames/` dosyaları tarayıcıda YouTube oynatılırken alınmış ekran görüntüleridir; indirilen bir video veya oyunun kaynak görselleri değildir. Zamanlar hızlandırılmış **YouTube zamanıdır**.

| Zaman | Dosya | Görünen durum |
| --- | --- | --- |
| 00:10 | `0010.jpg` | İlk harita, puan 0; kademeli üst tuğlalar ve iki yatay alt sıra |
| 00:30 | `0030.jpg` | İlk harita sonlarına yakın; birden fazla top |
| 00:35 | `0035.jpg` | İkinci harita; üç yatay bant içinde dikey tuğlalar ve metal uçlar |
| 00:40 | `0040.jpg` | İkinci haritanın kısmen temizlenmiş hali |
| 00:55 | `0055.jpg` | İç içe renkli kıvrımlar/spiral düzen; L biçimli tuğlalar |
| 02:00 | `0120.jpg` | Çapraz/halka benzeri düzenin kısmen temizlenmiş hali; ek nesneler |
| 09:10 | `0550.jpg` | Yeşil simetrik düzen, merkezde boşluk ve metal bloklar |
| 17:57 civarı | `1077.jpg` | Kısmi harita; farklı çubuk biçimi ve uzun dikey atış izleri |
| 29:54 civarı | `1794.jpg` | Kısmi metal çerçeve ve çok renkli bloklar |
| 58:17 civarı | `stage-15.jpg` | **Stage 15** yazısı; ilk haritaya benzeyen tekrar düzeni, can göstergesi X0 |

Son kare Stage 15'i açıkça gösteriyor. **“Oyun 15 bölüm” veya “kesin 14 harita döngüsü var” sonucu çıkarılmadı.** Puanın sonraki örneklerde düşmesi, tekrarlar, Continue/yeniden başlama ve bölüm sayacı birlikte incelenmeli. Tek tek görüntüler bölüm başlangıcı olmayabilir ve haritanın bir kısmı zaten kırılmış olabilir.

## Analiz nasıl yapıldı? Devam ederken nelere dikkat edilmeli?

1. Codex'in yerleşik tarayıcı becerisi okunarak YouTube arka planda açıldı; DOM üzerinden görünen oynatıcı kontrolleri ve ekran görüntüleri kullanıldı. Video indirilmedi.
2. YouTube `Seek slider` üzerinde Home başa döner, sağ/sol ok 5 saniye ilerler/geri gider; 0–9 tuşları videonun yüzde dilimlerine atlar. Büyük atlamalardan sonra görüntü yüklenene kadar kontrol edilmeli.
3. Salt okunur HTML video `currentTime`, `readyState` ve `seeking` alanlarıyla zaman/yükleme denetlendi. `currentTime` doğrudan değiştirilmedi; ilerleme oynatıcı arayüzünden yapıldı.
4. **Hızlı, aynı çağrı içindeki toplu ekran görüntüsü alma güvenilir olmadı.** Oynatıcı eski kare, yükleme simgesi, kırpılmış ekran veya öneri paneli gösterebiliyor. Bazı batch denemelerinde `readyState=4` yeterli olmadı. Ayrı bir çağrıda ekranı görüp tam oyun alanını doğrula; sonra kaydet. Yanlış etiketli/kırpılmış deneme kareleri teslim kanıtlarından çıkarıldı.
5. Reklam çıkınca kaydırıcı devre dışı kalıyor ve video zamanı reklama ait olabiliyor. Reklamı arayüzde Skip ile geç, yeniden duraklat ve oyunun zamanını doğrula.
6. Tam ekran görünümü arayüz işlemleri sırasında bozulabiliyor. Kontrol adları `Full screen (f)` / `Full screen keyboard shortcut f` gibi değişiyor. Yeni DOM durumundan doğru düğmeyi bul; eski tab numaralarına güvenme.
7. Normal hız/hızlanma 4× videodan doğrudan tahmin edilmemeli. Tuğla başına puan da güçlendirme/özel nesne bonusları ayrıştırılmadan çıkarılmamalı.

Topfield'in eski TAP SDK örnek arşivleri araştırıldı; ExBlock kaynak kodu bulunmadı. Aynı arşivleri tekrar aramak şu an öncelik değil.

## 2. oturum durumu (4 Ekim 2026)

- Oyun `index.html` + `src/levels.js` + `src/game.js` olarak yeniden yazıldı. Mantıksal alan 1264×948, yani referans karelerinin ölçeği.
- Haritalar: **Stage 1–10**, kullanıcının gönderdiği "Stage N" karelerinden ölçüldü (`reference-frames/user-stage-*.jpg`). Stage 10 bitince "Stage 10 tamamlandı" ekranı çıkıyor. Sırası bilinmeyen yeşil simetrik harita (`0550.jpg`) oyunda değil, `EXBLOCK_UNPLACED` içinde bekliyor.
- Sıradaki iş: Stage 11 ve sonrası için kareler; Stage 8 yazı altı bölgesi ve Stage 10 karesinin dosyası.
- Menü (New Game / Continue / Exit), HUD (X can, SCORE 8 hane), Stage yazısı ve nebula arka plan referanslara göre çizildi. Continue, bölüm başında tarayıcıya kayıt tutuyor (orijinal davranış doğrulanmadı).
- Kurallar `src/game.js` → `RULES`: başlangıç 5 can, tuğla +1000, çubuğa çarpma +100, baloncuk bonusu +10000 (gözlem, `birinci.mov`); çizgili blok 2 vuruş, metal kırılmaz, baloncuk olasılığı %12, top/çubuk hızları (varsayım).
- Videodan uygulananlar: bölüm girişi animasyonu (koyu gri → gümüş → renk), kırılma animasyonu, çizgili tuğla 2 vuruş, Stage 6 hareketli mavi kareler, yaratıklar (+50000), baloncuk ödülleri (+10000; lazer çubuk / ekstra can / yalnız puan).
- Videodan henüz uygulanmayanlar: turuncu ateş topları ve füze mermileri (tetikleyici belirsiz), top/çubuk hızları (4x ekran kaydından ölçülemedi).
- Çoklu top ve lazer yalnızca `?debug` modunda (1, 2 tuşları); hangi nesnenin bunları verdiği bilinmiyor.
- Testler: `node tests/levels.test.js`. Tarayıcıda menü, 4 harita ve kısa oynanış hatasız çalıştı.
- **YouTube bu ortamdan açılamıyor (bot doğrulaması).** Yeni haritalar için kullanıcıdan "Stage N" kareleri alınmalı. Ayrıntı ve çözülmemiş farklar için ORIGINAL-ANALYSIS.md.

- Oyunda Stage 1–74 var (orijinal oyunun tamamı; uzun videoda 74'ten sonra oyun sonu geliyor). Stage 32–74 kullanıcının masaüstü ekran kaydından ölçüldü (`reference-frames/kayit2-stage-NN.jpg`). Stage 22–31 `yeni_parca_01…25` videolarından ölçüldü (kareler `reference-frames/parca-stage-NN.jpg`); 23, 27, 28, 29 ve 31'deki kayan blokların hızı yaklaşık. Continue orijinaldeki gibi ulaşılan bölümler arasında seçim ekranı açar (0 puan, 5 can).
- Menüde **Stage Select** var (orijinalde yok): tüm bölümler küçük resimleriyle listelenir, tıklanan bölüm 5 canla başlar. `index.html#stage7` bağlantısı doğrudan o bölümü, `#stages` seçim ekranını açar.

## Devam edecek Codex için işler

Önce araştırmayı tamamla, sonra oyun davranışını değiştir:

- [ ] Uzun videoda **her bölüm geçişinin numarasını ve zamanını** çıkar. Önce ilk yaklaşık 10 dakikayı ayrıntılı incele; sonra kalan videodaki tekrar/yeniden başlama/bitiş ilişkisini çöz. Mevcut tarama tam değildir.
- [ ] Her farklı harita için tuğlalar kırılmadan başlangıç karesi al; bölüm numarası ve zamanla dosyalandır. Tam başlangıç karesi yoksa sonraki tekrar veya başka kayıtla tamamla.
- [ ] Haritaları veri olarak yaz: tuğla x/y, en/boy, renk/tür, kırılabilirlik/dayanıklılık. Yatay, dikey, kare ve L biçimli bloklar var; tek tip dikdörtgen ızgaraya indirgeme.
- [ ] Toplam bölüm sayısını ve tekrar kuralını doğrula. Stage 15 ile ilk düzen arasındaki benzerliği takip et; yorumları kanıt yerine kullanma.
- [ ] Puan artışlarını tek tek izole et; başlangıç canını, can kaybını/ekstra canı ve çoklu top bittiğinde ne olduğunu izle.
- [ ] Düşen/ek nesnelerin çubukla temasından önce/sonra kareleri karşılaştır. Çoklu top ve ateş eden çubuk görülüyor; hangi simgenin hangi etkiyi verdiği henüz kesin değil. Kahverengi spiral biçimli nesnelere kanıtsız bir işlev atama.
- [ ] Metal blokların hasar durumunu ve bölüm bitirme koşulunu izle. Tek görüntüden bütün metal blokları yok edilemez sayma.
- [ ] Normal hızdaki kısa videodan top hızı, çubuk hızı, çarpışma açısı, hızlanma ve sesleri incele. Videodaki müzik oyunun kendi sesi kabul edilmemeli.
- [ ] New Game / Continue / Exit akışını ve kayıt davranışını doğrula. Cihaz kapanınca kaydın kalıp kalmadığı videodan bilinmiyor.
- [ ] Bulgu → zaman damgası → ekran görüntüsü → güven düzeyi şeklinde analiz notlarını güncelle. Belirsiz kuralları açıkça belirt.
- [ ] Doğrulanmış haritaları ve kuralları `index.html` prototipine uygula; gerekirse kodu modüllere ayır. Özgün menü, HUD, nebula, çubuk ve tuğla görünümünü yeniden çiz.
- [ ] Oynanışı tarayıcıda doğrula: başlatma, bölüm geçişi, çoklu top, can kaybı, duraklatma, yeniden başlama ve mobil kontroller. Görsel karşılaştırma kareleri kaydet.

Son kullanıcı talimatı: limiti tüketmeden düzgün bir noktada dur, yöntemi ve kalan işleri README'ye yaz, GitHub'a pushla. Araştırmayı baştan başlatma; bu kayıt ve kaynak görüntülerden devam et. Kullanıcı yeniden devam istediğinde bu iş sırasını izle.


> `reference-frames/` klasöründeki karşılaştırma kareleri telif nedeniyle depoda tutulmuyor (yerel çalışma klasörü, `.gitignore`).
