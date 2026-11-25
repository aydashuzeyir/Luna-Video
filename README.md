# Luna Video Vault — telefondan APK qurmaq

1. github.com-da pulsuz hesab aç (brauzerdə).
2. "New repository" bas, ad: luna-video, "Public" seç, "Create repository" bas.
3. "uploading an existing file" linkinə bas və bu faylları seç: App.tsx, package.json, app.json, babel.config.js. "Commit changes" bas.
4. "Add file" > "Create new file" bas. Ad xanasına tam bunu yaz: .github/workflows/build.yml
   Sonra build.yml faylının məzmununu kopyalayıb yapışdır, "Commit changes" bas.
5. "Actions" tabına keç. "Build APK" işləyir (10–20 dəqiqə). Yaşıl işarə çıxsa, hazırdır.
6. Repozitoriyanın ana səhifəsində sağda "Releases" bölməsinə bas, ən yeni buraxılışdan app-release.apk faylını endir və aç.
7. Telefon "naməlum mənbədən quraşdırma" icazəsi istəyəcək, icazə ver.

Qırmızı xəta çıxsa: Actions > uğursuz işə bas > xətanın son 20 sətrini mənə göndər.

## Telegramdan birbaşa göndərmək
Telegramda videonu aç, sağ yuxarıda üç nöqtəyə bas, "Paylaş" (Share) seç, siyahıdan "Luna Video Vault"u seç. Video avtomatik tətbiqə köçürülür. Qeyd: bu yalnız APK versiyasında işləyir, veb versiyada yox.
