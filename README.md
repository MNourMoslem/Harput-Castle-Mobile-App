# Harput Rehberi

Harput Rehberi, Harput Kalesi ve çevresindeki tarihi mekanları tanıtan, Expo tabanlı bir mobil rehber uygulamasıdır.

## Proje Ekibi

- **Muhammet Nur Mislem** – Mobil ve AR
- **Şahed Tutah** – Backend ve Documantasyon
- **Celal Alkadı**

## Proje Kapsamı

- `mobile/` – Expo Router tabanlı mobil uygulama
- `backend/` – FastAPI tabanlı içerik yönetimi ve API sunucusu

## Özellikler

- Tam ekran görsel, karşılama metni, dil seçimi ve ziyaret edilen yerlere ait ilerleme özetiyle ana sayfa
- Harita sekmesinde tarihi mekanların kart listesi ve detay overlay'i
- Kademeli yükleme, yenileme desteği ve tam ekran görüntüleyici içeren galeri
- Kalıcı ilerleme, devam etme/yeniden başlatma ve sonuç takibi içeren quiz akışı
- Tarihçe bölümleri listesi ve her bölüm için detay ekranı
- Türkçe ve İngilizce dil desteği ve dile özgü içerik yükleme
- Dil seçimi, quiz ilerlemesi ve mekan bazlı kullanıcı tercihlerinin AsyncStorage ile cihazda saklanması

## Ana Ekranlar

- `Home` – görsel kimlik ve ilerleme özeti
- `Map` – mekan kartları ve detay overlay'i
- `Gallery` – görsel ızgarası ve tam ekran görüntüleyici
- `Quiz` – kaydedilmiş ilerlemeli zamanlı quiz
- `History` – bölüm listesi ve detay sayfaları
- `AR` – artırılmış gerçeklik deneyimi
- `Assistant` – yapay zeka destekli asistan

## Veri ve Kalıcılık

- İçerik kaynağı: `mobile/data/content` altındaki gömülü JSON dosyaları
- Desteklenen diller: İngilizce ve Türkçe
- Dil kalıcılığı: AsyncStorage
- Quiz kalıcılığı: AsyncStorage
- Mekan bazlı kullanıcı verisi kalıcılığı: AsyncStorage

## Teknoloji Yığını

- Expo 54
- React 19
- React Native 0.81
- Expo Router
- AsyncStorage
- Expo Localization
- Expo Image
- React Native Maps

## Proje Yapısı

```text
.
├── README.md
└── mobile/
    ├── app/
    ├── components/
    ├── constants/
    ├── contexts/
    ├── data/
    ├── locales/
    ├── services/
    ├── types/
    └── package.json
```

## Başlarken

### Ön Gereksinimler

- Node.js
- Python 3.8+

### Kurulum ve Çalıştırma

Backend API'yi başlatmak için:
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --host --port 8000
```

Mobil uygulamayı başlatmak için:
```bash
cd mobile
npm install
npm run start
```