/* eslint-env node */
/* global __dirname */
const fs = require('fs');
const path = require('path');

// Görsel listesi ve uzantıları (Örnek olarak hepsini .jpg varsayıyoruz)
const IMAGES = [
  "Artuklu-sarayi-kalintilari",
  "Artuklu-sarayi-kazi",
  "Artuklu-sarnici-ve-zindani",
  "Aslanli-burc-ve-kale-kitabesi",
  "harput-genel",
  "harput-ici",
  "Harput-kalesi",
  "Harput-kalesi-dogu-terasi",
  "Harput-kalesi-girisi",
  "Harput-kalesi-ici-ve-Artuklu-cami-harabeleri",
  "Harput-kalesi-orijinal-kesme-taslari",
  "Harput-kalesi-tarihi-hamami",
  "Harput-kalesi-ucuncu-bolge-kazilari-ve-manzarasi",
  "Harput-kalesi-ve-Suryani-Kadim-Meryem-Ana-Kilisesi",
  "harput-yakindan",
  "harput-zindani",
  "harput-zindani-sonu",
  "mancanik",
  "ulu-cami"
];

const BASE_PATH = path.join(__dirname, 'data', 'content');
const LANGUAGES = ['tr', 'en'];
const FOLDERS = [
  'places/meta',
  'places/detail',
  'timelines/meta',
  'timelines/story',
  'quiz/questions'
];

// 1. Klasörleri Oluştur
LANGUAGES.forEach(lang => {
  FOLDERS.forEach(folder => {
    const dir = path.join(BASE_PATH, lang, folder);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
});

// İsimleri id formuna çevir
function createId(name) {
  return name.toLowerCase();
}

// 2. Her görsel için dummy (uydurma) içerikleri üret
IMAGES.forEach((img, index) => {
  const id = createId(img);
  const imageAsset = `media/${img}.jpg`;

  // --- TR İÇERİKLER ---
  const trPlaceMeta = {
    id: id,
    name: img.replace(/-/g, ' ').toUpperCase(),
    shortDescription: `${img.replace(/-/g, ' ')} için kısa bir açıklama.`,
    imageAsset: imageAsset,
    category: "historical",
    coordinate: { latitude: 38.705, longitude: 39.255 },
    yearOrEra: "12. Yüzyıl"
  };

  const trPlaceDetail = {
    id: id,
    about: `Harput Kalesi sınırları içindeki ${img.replace(/-/g, ' ')}, tarihi dokusuyla ziyaretçilerini büyülüyor. Kazı çalışmalarıyla gün yüzüne çıkan bu alanın tarihteki yeri çok büyüktür.`,
    audioAsset: `audio/${id}.mp3`,
    modelAsset: `models/${id}.glb`
  };

  const trTimelineMeta = {
    id: `tl-${id}`,
    placeId: id,
    title: `${img.replace(/-/g, ' ')}'nin İnşası`,
    description: "Bu efsanevi bölgenin yapım aşamaları ve tarihi olayları."
  };

  const trTimelineStory = {
    id: `tl-${id}`,
    placeId: id,
    events: [
      {
        id: `ev-${id}-1`,
        year: "1150",
        title: "İlk Temellerin Atılması",
        content: "Bölgenin savunmasını güçlendirmek amacıyla ilk temeller atıldı.",
        imageAsset: imageAsset
      }
    ]
  };

  const trQuiz = {
    id: `qz-${id}`,
    placeId: id,
    question: `${img.replace(/-/g, ' ')} hangi yüzyıla aittir?`,
    options: ["10. Yüzyıl", "12. Yüzyıl", "15. Yüzyıl", "19. Yüzyıl"],
    correctAnswerIndex: 1,
    explanation: "Eser, Artuklular döneminde 12. yüzyılda inşa edilmiştir."
  };

  // --- EN İÇERİKLER ---
  const enPlaceMeta = {
    id: id,
    name: img.replace(/-/g, ' ').toUpperCase() + " (EN)",
    shortDescription: `A short description for ${img.replace(/-/g, ' ')}.`,
    imageAsset: imageAsset,
    category: "historical",
    coordinate: { latitude: 38.705, longitude: 39.255 },
    yearOrEra: "12th Century"
  };

  const enPlaceDetail = {
    id: id,
    about: `The ${img.replace(/-/g, ' ')} located within Harput Castle mesmerizes its visitors with its historical texture. Uncovered through excavations, its place in history is magnificent.`,
    audioAsset: `audio/${id}.mp3`,
    modelAsset: `models/${id}.glb`
  };

  const enTimelineMeta = {
    id: `tl-${id}`,
    placeId: id,
    title: `Construction of ${img.replace(/-/g, ' ')}`,
    description: "The construction phases and historical events of this legendary area."
  };

  const enTimelineStory = {
    id: `tl-${id}`,
    placeId: id,
    events: [
      {
        id: `ev-${id}-1`,
        year: "1150",
        title: "Laying the First Foundations",
        content: "The first foundations were laid to strengthen the region's defense.",
        imageAsset: imageAsset
      }
    ]
  };

  const enQuiz = {
    id: `qz-${id}`,
    placeId: id,
    question: `Which century does ${img.replace(/-/g, ' ')} belong to?`,
    options: ["10th Century", "12th Century", "15th Century", "19th Century"],
    correctAnswerIndex: 1,
    explanation: "This structure was built during the Artuqid period in the 12th century."
  };

  // Yazma Helper
  const writeJSON = (lang, folder, id, data) => {
    const filePath = path.join(BASE_PATH, lang, folder, `${id}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  };

  // TR
  writeJSON('tr', 'places/meta', id, trPlaceMeta);
  writeJSON('tr', 'places/detail', id, trPlaceDetail);
  writeJSON('tr', 'timelines/meta', `tl-${id}`, trTimelineMeta);
  writeJSON('tr', 'timelines/story', `tl-${id}`, trTimelineStory);
  writeJSON('tr', 'quiz/questions', `qz-${id}`, trQuiz);

  // EN
  writeJSON('en', 'places/meta', id, enPlaceMeta);
  writeJSON('en', 'places/detail', id, enPlaceDetail);
  writeJSON('en', 'timelines/meta', `tl-${id}`, enTimelineMeta);
  writeJSON('en', 'timelines/story', `tl-${id}`, enTimelineStory);
  writeJSON('en', 'quiz/questions', `qz-${id}`, enQuiz);
});

console.log("Tüm JSON dosyaları (TR ve EN) başarıyla oluşturuldu!");
