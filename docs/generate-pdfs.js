/**
 * Harput Rehberi — PDF Generator
 * Generates: SWOT.pdf, RAMS.pdf, THS_report.pdf, Requirements.pdf, UserScenario.pdf
 * Run: node generate-pdfs.js
 */

const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const OUT_DIR = __dirname;

// ─── Shared CSS ────────────────────────────────────────────────────────────────
const BASE_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');

  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
    font-size: 11pt;
    color: #1a1a2e;
    background: #fff;
    line-height: 1.6;
  }

  /* ── Cover Page ── */
  .cover {
    page-break-after: always;
    height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background: linear-gradient(145deg, #1a0a05 0%, #3d1f0d 50%, #5c2e0e 100%);
    color: #fff;
    padding: 60px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }
  .cover::before {
    content: '';
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23c9a84c' fill-opacity='0.06'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
    opacity: 0.4;
  }
  .cover-badge {
    background: rgba(201,168,76,0.2);
    border: 1px solid rgba(201,168,76,0.5);
    color: #c9a84c;
    font-size: 9pt;
    font-weight: 600;
    letter-spacing: 3px;
    text-transform: uppercase;
    padding: 6px 20px;
    border-radius: 20px;
    margin-bottom: 32px;
    position: relative;
    z-index: 1;
  }
  .cover-icon {
    font-size: 64px;
    margin-bottom: 24px;
    position: relative;
    z-index: 1;
  }
  .cover h1 {
    font-size: 34pt;
    font-weight: 800;
    color: #fff;
    letter-spacing: 1px;
    line-height: 1.2;
    margin-bottom: 12px;
    position: relative;
    z-index: 1;
  }
  .cover h2 {
    font-size: 14pt;
    font-weight: 400;
    color: #c9a84c;
    letter-spacing: 4px;
    text-transform: uppercase;
    margin-bottom: 40px;
    position: relative;
    z-index: 1;
  }
  .cover-divider {
    width: 80px;
    height: 2px;
    background: linear-gradient(90deg, transparent, #c9a84c, transparent);
    margin: 0 auto 40px;
    position: relative;
    z-index: 1;
  }
  .cover-meta {
    background: rgba(255,255,255,0.06);
    border: 1px solid rgba(255,255,255,0.12);
    border-radius: 12px;
    padding: 24px 40px;
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: 500px;
  }
  .cover-meta-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255,255,255,0.07);
    font-size: 10pt;
  }
  .cover-meta-row:last-child { border-bottom: none; }
  .cover-meta-label { color: rgba(255,255,255,0.5); font-weight: 400; }
  .cover-meta-value { color: #fff; font-weight: 600; }

  /* ── Page Header ── */
  .page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px 48px;
    border-bottom: 2px solid #c9a84c;
    margin-bottom: 32px;
    background: #fdf9f5;
  }
  .page-header-left {
    font-size: 9pt;
    color: #888;
    font-weight: 500;
    letter-spacing: 0.5px;
  }
  .page-header-title {
    font-size: 11pt;
    font-weight: 700;
    color: #3d1f0d;
    letter-spacing: 0.5px;
  }
  .page-header-right {
    font-size: 9pt;
    color: #888;
  }

  /* ── Content Area ── */
  .content { padding: 0 48px 48px; }

  /* ── Section ── */
  .section { margin-bottom: 36px; page-break-inside: avoid; }
  .section-title {
    font-size: 16pt;
    font-weight: 700;
    color: #3d1f0d;
    border-left: 4px solid #c9a84c;
    padding-left: 14px;
    margin-bottom: 16px;
    line-height: 1.3;
  }
  .section-subtitle {
    font-size: 12pt;
    font-weight: 600;
    color: #5c2e0e;
    margin-bottom: 10px;
    margin-top: 20px;
  }
  p { margin-bottom: 10px; color: #333; }

  /* ── Tables ── */
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 10pt; }
  thead tr { background: #3d1f0d; color: #fff; }
  thead th { padding: 10px 12px; text-align: left; font-weight: 600; letter-spacing: 0.3px; }
  tbody tr { border-bottom: 1px solid #e8e0d4; }
  tbody tr:nth-child(even) { background: #fdf9f5; }
  tbody td { padding: 9px 12px; color: #333; vertical-align: top; }
  tbody td:first-child { font-weight: 600; color: #3d1f0d; white-space: nowrap; }

  /* ── SWOT Grid ── */
  .swot-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
  .swot-card { border-radius: 10px; padding: 20px; page-break-inside: avoid; }
  .swot-card.strengths { background: #eef8f0; border: 1px solid #6dbf82; }
  .swot-card.weaknesses { background: #fef3f0; border: 1px solid #f4845f; }
  .swot-card.opportunities { background: #eef4ff; border: 1px solid #6b8ff7; }
  .swot-card.threats { background: #fef9ec; border: 1px solid #f5c842; }
  .swot-card-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 14px;
  }
  .swot-card-icon { font-size: 22px; }
  .swot-card-title { font-size: 12pt; font-weight: 700; }
  .swot-card.strengths .swot-card-title { color: #2d7a40; }
  .swot-card.weaknesses .swot-card-title { color: #c0392b; }
  .swot-card.opportunities .swot-card-title { color: #2c5faa; }
  .swot-card.threats .swot-card-title { color: #b7860b; }
  .swot-item { display: flex; gap: 8px; margin-bottom: 8px; font-size: 10pt; color: #444; }
  .swot-item-num { font-weight: 700; min-width: 20px; }

  /* ── Risk Badge ── */
  .badge {
    display: inline-block;
    padding: 3px 10px;
    border-radius: 12px;
    font-size: 9pt;
    font-weight: 700;
    letter-spacing: 0.3px;
  }
  .badge-high { background: #fde8e8; color: #c0392b; }
  .badge-medium { background: #fef3cd; color: #b7860b; }
  .badge-low { background: #e8f5e9; color: #2d7a40; }
  .badge-critical { background: #c0392b; color: #fff; }

  /* ── Info Box ── */
  .info-box {
    background: #fdf9f5;
    border-left: 4px solid #c9a84c;
    border-radius: 0 8px 8px 0;
    padding: 14px 18px;
    margin-bottom: 16px;
    font-size: 10pt;
    color: #444;
  }
  .info-box strong { color: #3d1f0d; }

  /* ── Team Table ── */
  .team-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
  .team-card {
    background: #fdf9f5;
    border: 1px solid #e8d9c0;
    border-radius: 10px;
    padding: 16px;
    text-align: center;
  }
  .team-avatar {
    width: 48px; height: 48px;
    background: linear-gradient(135deg, #3d1f0d, #c9a84c);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-size: 18pt;
    font-weight: 700;
    margin: 0 auto 10px;
  }
  .team-name { font-size: 10pt; font-weight: 700; color: #3d1f0d; margin-bottom: 4px; }
  .team-id { font-size: 9pt; color: #888; margin-bottom: 6px; }
  .team-role {
    font-size: 9pt;
    background: rgba(201,168,76,0.15);
    color: #8a6010;
    padding: 3px 10px;
    border-radius: 12px;
    font-weight: 600;
    display: inline-block;
  }

  /* ── Scenario Card ── */
  .scenario-card {
    background: #fdf9f5;
    border: 1px solid #e8d9c0;
    border-radius: 12px;
    padding: 22px;
    margin-bottom: 20px;
    page-break-inside: avoid;
  }
  .scenario-header { display: flex; align-items: flex-start; gap: 14px; margin-bottom: 14px; }
  .scenario-num {
    width: 36px; height: 36px;
    background: linear-gradient(135deg, #3d1f0d, #c9a84c);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: 800;
    font-size: 12pt;
    flex-shrink: 0;
  }
  .scenario-title { font-size: 12pt; font-weight: 700; color: #3d1f0d; }
  .scenario-actor { font-size: 9pt; color: #888; margin-top: 2px; }
  .scenario-steps { list-style: none; padding-left: 50px; }
  .scenario-steps li {
    position: relative;
    padding: 5px 0 5px 20px;
    font-size: 10pt;
    color: #444;
    border-bottom: 1px dashed #e8d9c0;
  }
  .scenario-steps li:last-child { border-bottom: none; }
  .scenario-steps li::before {
    content: '→';
    position: absolute;
    left: 0;
    color: #c9a84c;
    font-weight: 700;
  }
  .scenario-meta { display: flex; gap: 16px; margin-top: 12px; padding-left: 50px; }
  .scenario-tag {
    font-size: 9pt;
    background: #e8f0fe;
    color: #3d5a99;
    padding: 3px 10px;
    border-radius: 10px;
    font-weight: 600;
  }

  /* ── Req Item ── */
  .req-item {
    display: flex;
    gap: 12px;
    padding: 10px 0;
    border-bottom: 1px solid #f0e8dc;
    align-items: flex-start;
    font-size: 10pt;
  }
  .req-id {
    background: #3d1f0d;
    color: #c9a84c;
    font-size: 8pt;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 6px;
    white-space: nowrap;
    min-width: 60px;
    text-align: center;
  }
  .req-text { color: #333; flex: 1; }
  .req-priority { font-size: 8pt; font-weight: 700; white-space: nowrap; }
  .req-priority.high { color: #c0392b; }
  .req-priority.medium { color: #b7860b; }
  .req-priority.low { color: #2d7a40; }

  /* ── Page Break ── */
  .page-break { page-break-before: always; }

  /* ── Architecture Box ── */
  .arch-box {
    border: 1px solid #e8d9c0;
    border-radius: 10px;
    overflow: hidden;
    margin-bottom: 20px;
  }
  .arch-box-header {
    background: #3d1f0d;
    color: #c9a84c;
    font-weight: 700;
    font-size: 10pt;
    padding: 10px 16px;
    letter-spacing: 0.5px;
  }
  .arch-box-body { padding: 14px 16px; }
  .arch-row { display: flex; gap: 12px; flex-wrap: wrap; }
  .arch-tag {
    background: #fdf9f5;
    border: 1px solid #e8d9c0;
    border-radius: 6px;
    padding: 5px 12px;
    font-size: 9pt;
    color: #3d1f0d;
    font-weight: 600;
  }

  /* ── Footer ── */
  .doc-footer {
    margin-top: 48px;
    padding-top: 16px;
    border-top: 1px solid #e8d9c0;
    display: flex;
    justify-content: space-between;
    font-size: 8pt;
    color: #aaa;
  }
`;

// ─── Helper ────────────────────────────────────────────────────────────────────
function pageHeader(docTitle, section) {
  return `
    <div class="page-header">
      <span class="page-header-left">Harput Rehberi Uygulaması</span>
      <span class="page-header-title">${docTitle}</span>
      <span class="page-header-right">${section}</span>
    </div>
  `;
}

function teamMeta() {
  return `
    <div class="team-grid">
      <div class="team-card">
        <div class="team-avatar">Ş</div>
        <div class="team-name">Şehed Totah</div>
        <div class="team-id">225541603</div>
        <div class="team-role">Backend + Koordinatör</div>
      </div>
      <div class="team-card">
        <div class="team-avatar">C</div>
        <div class="team-name">Celal Alkadı</div>
        <div class="team-id">225541605</div>
        <div class="team-role">Backend Yardımcısı</div>
      </div>
      <div class="team-card">
        <div class="team-avatar">M</div>
        <div class="team-name">Muhamed Nur Muslim</div>
        <div class="team-id">245541016</div>
        <div class="team-role">AR + Mobil Geliştirici</div>
      </div>
    </div>
  `;
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. SWOT.html
// ══════════════════════════════════════════════════════════════════════════════
const SWOT_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8"/>
  <style>${BASE_CSS}</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-badge">Proje Analiz Belgesi</div>
  <div class="cover-icon">🏰</div>
  <h1>SWOT ANALİZİ</h1>
  <h2>Harput Rehberi</h2>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <div class="cover-meta-row">
      <span class="cover-meta-label">Proje Adı</span>
      <span class="cover-meta-value">Harput Rehberi Mobil Uygulaması</span>
    </div>
    <div class="cover-meta-row">
      <span class="cover-meta-label">Belge Türü</span>
      <span class="cover-meta-value">SWOT Analizi</span>
    </div>
    <div class="cover-meta-row">
      <span class="cover-meta-label">Üniversite</span>
      <span class="cover-meta-value">Fırat Üniversitesi</span>
    </div>
    <div class="cover-meta-row">
      <span class="cover-meta-label">Bölüm</span>
      <span class="cover-meta-value">Bilgisayar Mühendisliği</span>
    </div>
    <div class="cover-meta-row">
      <span class="cover-meta-label">Tarih</span>
      <span class="cover-meta-value">Haziran 2026</span>
    </div>
    <div class="cover-meta-row">
      <span class="cover-meta-label">Sürüm</span>
      <span class="cover-meta-value">v1.0</span>
    </div>
  </div>
</div>

<!-- HEADER -->
${pageHeader('SWOT Analizi', 'Takım Bilgileri')}
<div class="content">
  <div class="section">
    <div class="section-title">Takım Bilgileri</div>
    ${teamMeta()}
    <div class="info-box">
      <strong>Belge Amacı:</strong> Bu belge, Harput Rehberi mobil uygulamasının güçlü ve zayıf yönlerini, fırsatlarını ve tehditlerini sistematik biçimde analiz etmektedir. Analiz; teknoloji, piyasa, ekip ve sürdürülebilirlik boyutlarını kapsamaktadır.
    </div>
  </div>

  <div class="section">
    <div class="section-title">Projeye Genel Bakış</div>
    <p>
      <strong>Harput Rehberi</strong>, Türkiye'nin Elazığ iline bağlı tarihi Harput bölgesini ve Harput Kalesi'ni ziyaret eden kullanıcılara kapsamlı bir dijital rehberlik deneyimi sunan çok platformlu bir mobil uygulamadır.
    </p>
    <p>
      Uygulama; <strong>React Native (Expo)</strong> tabanlı mobil istemci ve <strong>FastAPI (Python)</strong> tabanlı REST API arka ucundan oluşmaktadır. Kullanıcılara tarihsel içerik, fotoğraf galerisi, bilgi yarışması, AI destekli sohbet asistanı (Google Gemini) ve Artırılmış Gerçeklik (AR) deneyimi sunmayı hedeflemektedir.
    </p>
  </div>
</div>

<!-- PAGE BREAK -->
<div class="page-break"></div>
${pageHeader('SWOT Analizi', 'Güçlü ve Zayıf Yönler')}
<div class="content">
  <div class="section">
    <div class="section-title">SWOT Matrisi</div>
    <div class="swot-grid">

      <div class="swot-card strengths">
        <div class="swot-card-header">
          <div class="swot-card-icon">💪</div>
          <div class="swot-card-title">Güçlü Yönler (Strengths)</div>
        </div>
        <div class="swot-item"><span class="swot-item-num">S1</span><span><strong>Modern Teknoloji Yığını:</strong> React Native, Expo, FastAPI ve Google Gemini AI gibi endüstri standardı teknolojiler kullanılmaktadır.</span></div>
        <div class="swot-item"><span class="swot-item-num">S2</span><span><strong>Çok Dil Desteği:</strong> Türkçe ve İngilizce tam destek; dinamik dil değiştirme ve locale geri dönüş mekanizması.</span></div>
        <div class="swot-item"><span class="swot-item-num">S3</span><span><strong>Çevrimdışı Kullanım:</strong> Temel içerikler yerel JSON dosyalarında; internet olmadan çalışabilir.</span></div>
        <div class="swot-item"><span class="swot-item-num">S4</span><span><strong>Güvenli API Tasarımı:</strong> JWT kimlik doğrulama, bcrypt şifreleme, cursor tabanlı sayfalama, SSE akışı.</span></div>
        <div class="swot-item"><span class="swot-item-num">S5</span><span><strong>Ölçeklenebilir Mimari:</strong> Katmanlı servis yapısı ve Context API ile ayrılmış durum yönetimi.</span></div>
        <div class="swot-item"><span class="swot-item-num">S6</span><span><strong>AR Altyapısı:</strong> Three.js, expo-three ve React Viro entegrasyonu ile 3D görselleştirme kapasitesi.</span></div>
        <div class="swot-item"><span class="swot-item-num">S7</span><span><strong>Kullanıcı Kişiselleştirmesi:</strong> Favori, ziyaret, puan ve not özellikleri ile zengin kullanıcı profili.</span></div>
      </div>

      <div class="swot-card weaknesses">
        <div class="swot-card-header">
          <div class="swot-card-icon">⚠️</div>
          <div class="swot-card-title">Zayıf Yönler (Weaknesses)</div>
        </div>
        <div class="swot-item"><span class="swot-item-num">W1</span><span><strong>AR Geliştirme Güçlüğü:</strong> AR ekranı tamamlanmamış; kütüphane uyumluluk sorunları ve sınırlı ekip deneyimi.</span></div>
        <div class="swot-item"><span class="swot-item-num">W2</span><span><strong>Eksik Gerçek İçerik:</strong> Harput'a özgü mekân detayları, tarih bölümleri ve quiz soruları henüz tam değil.</span></div>
        <div class="swot-item"><span class="swot-item-num">W3</span><span><strong>SQLite Kısıtlamaları:</strong> Geliştirme ortamında SQLite; eşzamanlı yazma işlemlerinde darboğaz yaratabilir.</span></div>
        <div class="swot-item"><span class="swot-item-num">W4</span><span><strong>İnteraktif Harita Eksikliği:</strong> React Native Maps kurulu ancak interaktif harita görünümü henüz uygulanmamış.</span></div>
        <div class="swot-item"><span class="swot-item-num">W5</span><span><strong>Tek Cihaz Senkronizasyonu:</strong> Kullanıcı verileri yalnızca cihazda; backend senkronizasyonu yok.</span></div>
        <div class="swot-item"><span class="swot-item-num">W6</span><span><strong>Gemini API Bağımlılığı:</strong> AI Asistan üçüncü taraf servise bağlı; kota/kesinti durumunda etkilenir.</span></div>
        <div class="swot-item"><span class="swot-item-num">W7</span><span><strong>Test Kapsamı Yok:</strong> Otomatik birim ve entegrasyon testleri henüz yazılmamış.</span></div>
      </div>

      <div class="swot-card opportunities">
        <div class="swot-card-header">
          <div class="swot-card-icon">🚀</div>
          <div class="swot-card-title">Fırsatlar (Opportunities)</div>
        </div>
        <div class="swot-item"><span class="swot-item-num">O1</span><span><strong>Kültürel Turizm Artışı:</strong> Türkiye'de iç turizm ve tarihi mekânlara olan ilgi belirgin şekilde artmaktadır.</span></div>
        <div class="swot-item"><span class="swot-item-num">O2</span><span><strong>Akıllı Turizm Trendleri:</strong> AR ve AI destekli uygulamalar küresel ölçekte güçlü bir pazar oluşturmaktadır.</span></div>
        <div class="swot-item"><span class="swot-item-num">O3</span><span><strong>Kurumsal İş Birlikleri:</strong> Elazığ Belediyesi veya Kültür ve Turizm Bakanlığı ile ortaklık potansiyeli.</span></div>
        <div class="swot-item"><span class="swot-item-num">O4</span><span><strong>Genişleme Potansiyeli:</strong> Mimari yapı, diğer Türkiye tarihi mekânlarına rahatlıkla genişletilebilir.</span></div>
        <div class="swot-item"><span class="swot-item-num">O5</span><span><strong>Eğitim Amaçlı Kullanım:</strong> Quiz ve tarih modülleri okul ve üniversiteler için eğitim materyali olabilir.</span></div>
        <div class="swot-item"><span class="swot-item-num">O6</span><span><strong>Çapraz Platform:</strong> Expo ile tek kod tabanından Android ve iOS'a dağıtım, maliyet avantajı sağlar.</span></div>
      </div>

      <div class="swot-card threats">
        <div class="swot-card-header">
          <div class="swot-card-icon">⚡</div>
          <div class="swot-card-title">Tehditler (Threats)</div>
        </div>
        <div class="swot-item"><span class="swot-item-num">T1</span><span><strong>Rekabet:</strong> Google Maps, Gezimanya ve benzeri uygulamalar geniş kullanıcı tabanına sahip.</span></div>
        <div class="swot-item"><span class="swot-item-num">T2</span><span><strong>Bağımlılık Güncellemeleri:</strong> Expo ve React Native'in hızlı güncelleme döngüsü sürekli bakım gerektirir.</span></div>
        <div class="swot-item"><span class="swot-item-num">T3</span><span><strong>API Maliyet Artışları:</strong> Google Gemini API fiyatlandırması değişebilir; uzun vadeli maliyet belirsizliği.</span></div>
        <div class="swot-item"><span class="swot-item-num">T4</span><span><strong>Veri Güvenliği (KVKK):</strong> Kullanıcı verilerinin yasal gereklilikler çerçevesinde korunması zorunludur.</span></div>
        <div class="swot-item"><span class="swot-item-num">T5</span><span><strong>Cihaz Uyumluluğu:</strong> AR özellikleri eski veya düşük donanımlı cihazlarda iyi çalışmayabilir.</span></div>
        <div class="swot-item"><span class="swot-item-num">T6</span><span><strong>İnternet Bağımlılığı:</strong> Galeri, yorumlar ve asistan özellikleri sürekli bağlantı gerektirir.</span></div>
      </div>

    </div>
  </div>
</div>

<!-- PAGE BREAK -->
<div class="page-break"></div>
${pageHeader('SWOT Analizi', 'Özet ve Sonuç')}
<div class="content">
  <div class="section">
    <div class="section-title">SWOT Özet Tablosu</div>
    <table>
      <thead>
        <tr><th>Boyut</th><th>Öge Sayısı</th><th>En Kritik Madde</th><th>Durum</th></tr>
      </thead>
      <tbody>
        <tr><td>💪 Güçlü Yönler</td><td>7 madde</td><td>Modern teknoloji yığını ve güvenli API tasarımı</td><td><span class="badge badge-low">Güçlü</span></td></tr>
        <tr><td>⚠️ Zayıf Yönler</td><td>7 madde</td><td>AR geliştirme güçlüğü ve eksik içerik</td><td><span class="badge badge-medium">Orta Risk</span></td></tr>
        <tr><td>🚀 Fırsatlar</td><td>6 madde</td><td>Kültürel turizm artışı ve kurumsal iş birlikleri</td><td><span class="badge badge-low">Yüksek Potansiyel</span></td></tr>
        <tr><td>⚡ Tehditler</td><td>6 madde</td><td>Rekabet ve API maliyet belirsizliği</td><td><span class="badge badge-medium">İzlenmeli</span></td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Stratejik Öneriler</div>
    <table>
      <thead>
        <tr><th>Strateji</th><th>Açıklama</th><th>Öncelik</th></tr>
      </thead>
      <tbody>
        <tr><td>SO Stratejisi</td><td>Güçlü teknoloji altyapısını kullanarak akıllı turizm pazarına hızla girilmeli; AR özelliği tamamlanarak fark yaratılmalı</td><td><span class="badge badge-high">Yüksek</span></td></tr>
        <tr><td>ST Stratejisi</td><td>Çevrimdışı çalışma kapasitesi ve yerel içerik zenginliği ile rekabetten ayrışma sağlanmalı</td><td><span class="badge badge-medium">Orta</span></td></tr>
        <tr><td>WO Stratejisi</td><td>Kurumsal iş birlikleri aracılığıyla gerçek Harput içeriği hızla tamamlanmalı; AR için uzman desteği alınmalı</td><td><span class="badge badge-high">Yüksek</span></td></tr>
        <tr><td>WT Stratejisi</td><td>KVKK uyumluluğu sağlanmalı; Gemini API için fallback mekanizması geliştirilmeli</td><td><span class="badge badge-medium">Orta</span></td></tr>
      </tbody>
    </table>
  </div>

  <div class="doc-footer">
    <span>Harput Rehberi — SWOT Analizi</span>
    <span>Haziran 2026 · Fırat Üniversitesi</span>
  </div>
</div>

</body>
</html>`;

// ══════════════════════════════════════════════════════════════════════════════
// 2. RAMS.html
// ══════════════════════════════════════════════════════════════════════════════
const RAMS_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8"/>
  <style>${BASE_CSS}</style>
</head>
<body>

<!-- COVER -->
<div class="cover">
  <div class="cover-badge">Proje Analiz Belgesi</div>
  <div class="cover-icon">🛡️</div>
  <h1>RAMS ANALİZİ</h1>
  <h2>Harput Rehberi</h2>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <div class="cover-meta-row">
      <span class="cover-meta-label">Proje Adı</span>
      <span class="cover-meta-value">Harput Rehberi Mobil Uygulaması</span>
    </div>
    <div class="cover-meta-row">
      <span class="cover-meta-label">Belge Türü</span>
      <span class="cover-meta-value">RAMS Analizi</span>
    </div>
    <div class="cover-meta-row">
      <span class="cover-meta-label">Üniversite</span>
      <span class="cover-meta-value">Fırat Üniversitesi</span>
    </div>
    <div class="cover-meta-row">
      <span class="cover-meta-label">Bölüm</span>
      <span class="cover-meta-value">Bilgisayar Mühendisliği</span>
    </div>
    <div class="cover-meta-row">
      <span class="cover-meta-label">Tarih</span>
      <span class="cover-meta-value">Haziran 2026</span>
    </div>
    <div class="cover-meta-row">
      <span class="cover-meta-label">Sürüm</span>
      <span class="cover-meta-value">v1.0</span>
    </div>
  </div>
</div>

${pageHeader('RAMS Analizi', 'Giriş')}
<div class="content">
  <div class="section">
    <div class="section-title">Takım Bilgileri</div>
    ${teamMeta()}
  </div>
  <div class="section">
    <div class="section-title">RAMS Nedir?</div>
    <p>
      <strong>RAMS</strong> analizi; bir sistemin <strong>Güvenilirlik (Reliability)</strong>, <strong>Erişilebilirlik (Availability)</strong>, <strong>Bakım Yapılabilirlik (Maintainability)</strong> ve <strong>Güvenlik (Safety/Security)</strong> boyutlarında sistematik değerlendirmesini ifade eder.
    </p>
    <div class="info-box">
      Bu belge, Harput Rehberi uygulamasının hem mobil (React Native/Expo) hem de backend (FastAPI/SQLite) bileşenlerini RAMS çerçevesinde kapsamlı biçimde analiz etmekte; tespit edilen risklere karşı alınan ve alınması planlanan önlemleri sunmaktadır.
    </div>
    <table>
      <thead><tr><th>Boyut</th><th>Tanım</th><th>Kapsam</th></tr></thead>
      <tbody>
        <tr><td>R — Güvenilirlik</td><td>Sistemin hatasız çalışma yeteneği</td><td>Backend, mobil, veritabanı</td></tr>
        <tr><td>A — Erişilebilirlik</td><td>Sistemin kullanılabilir olma oranı</td><td>API, çevrimdışı mod, üçüncü taraf servisler</td></tr>
        <tr><td>M — Bakım Yapılabilirlik</td><td>Güncelleme ve hata giderme kolaylığı</td><td>Kod kalitesi, bağımlılıklar, yapılandırma</td></tr>
        <tr><td>S — Güvenlik</td><td>Saldırı ve veri ihlallerine dayanıklılık</td><td>Kimlik doğrulama, veri koruma, KVKK</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="page-break"></div>
${pageHeader('RAMS Analizi', 'R — Güvenilirlik')}
<div class="content">
  <div class="section">
    <div class="section-title">R — Güvenilirlik (Reliability)</div>
    <p>Sistemin belirli koşullar altında, belirli bir süre boyunca arızalanmadan doğru şekilde çalışma yeteneğidir.</p>
    <table>
      <thead>
        <tr><th style="width:50px">ID</th><th>Risk / Gereksinim</th><th>Etki</th><th>Mevcut Önlem</th><th>Ek Öneri</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>R-01</td>
          <td>Backend sürecinin beklenmedik şekilde çökmesi</td>
          <td><span class="badge badge-high">Yüksek</span></td>
          <td>Uvicorn process yönetimi</td>
          <td>PM2 / Systemd ile otomatik yeniden başlatma</td>
        </tr>
        <tr>
          <td>R-02</td>
          <td>SQLite veritabanı dosyasının disk bozulması nedeniyle zarar görmesi</td>
          <td><span class="badge badge-high">Yüksek</span></td>
          <td>Alembic migrasyon desteği kurulmuş</td>
          <td>Düzenli yedekleme (cron); üretimde PostgreSQL geçişi</td>
        </tr>
        <tr>
          <td>R-03</td>
          <td>JWT access token süresinin beklenmedik dolması ve oturum kopması</td>
          <td><span class="badge badge-medium">Orta</span></td>
          <td>Refresh token rotasyonu uygulandı</td>
          <td>Mobil tarafta sessiz token yenileme mekanizması</td>
        </tr>
        <tr>
          <td>R-04</td>
          <td>Hatalı MIME tipi veya aşırı büyük dosya yükleme</td>
          <td><span class="badge badge-low">Düşük</span></td>
          <td>MIME doğrulama + 10 MB sınırı uygulandı</td>
          <td>Hata mesajları mobil arayüzde kullanıcıya gösterilmeli</td>
        </tr>
        <tr>
          <td>R-05</td>
          <td>Expo bağımlılık güncellemesi sonrası uygulama çökmesi</td>
          <td><span class="badge badge-medium">Orta</span></td>
          <td>package-lock.json sürüm kilitleme</td>
          <td>CI/CD pipeline ile her güncellemede otomatik test</td>
        </tr>
        <tr>
          <td>R-06</td>
          <td>AsyncStorage veri kaybı (uygulama kaldırma veya cihaz değişimi)</td>
          <td><span class="badge badge-low">Düşük</span></td>
          <td>Kullanıcı bilgilendirmesi</td>
          <td>İleride backend kullanıcı verisi senkronizasyonu</td>
        </tr>
        <tr>
          <td>R-07</td>
          <td>Gemini API yanıt tutarsızlığı veya boş yanıt dönmesi</td>
          <td><span class="badge badge-medium">Orta</span></td>
          <td>SSE hata payload'ı ile client'a bildirim</td>
          <td>Retry mekanizması ve fallback mesajı</td>
        </tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">A — Erişilebilirlik (Availability)</div>
    <p>Sistemin gerektiğinde kullanılabilir olma ve hizmet vermeye devam etme oranıdır.</p>
    <table>
      <thead>
        <tr><th style="width:50px">ID</th><th>Risk / Gereksinim</th><th>Etki</th><th>Mevcut Önlem</th><th>Ek Öneri</th></tr>
      </thead>
      <tbody>
        <tr>
          <td>A-01</td>
          <td>Backend sunucusu kapalı olduğunda uygulamanın tamamen kullanılamaz hale gelmesi</td>
          <td><span class="badge badge-high">Yüksek</span></td>
          <td>Yerel JSON içerikler çevrimdışı erişim sağlar; temel özellikler çevrimdışı çalışır</td>
          <td>Expo OTA güncellemesi ile kritik düzeltmeler hızla dağıtılabilir</td>
        </tr>
        <tr>
          <td>A-02</td>
          <td>Google Gemini API kesintisi veya kota aşımı</td>
          <td><span class="badge badge-medium">Orta</span></td>
          <td>503 hata kodu ile kullanıcıya anlamlı mesaj</td>
          <td>Alternatif AI sağlayıcısına (OpenAI/Anthropic) fallback</td>
        </tr>
        <tr>
          <td>A-03</td>
          <td>SQLite eşzamanlı yazma kısıtlaması (yüksek kullanıcı sayısında)</td>
          <td><span class="badge badge-medium">Orta</span></td>
          <td>SQLite WAL modu aktif</td>
          <td>Üretim ortamı için PostgreSQL veya MySQL geçişi planlanmalı</td>
        </tr>
        <tr>
          <td>A-04</td>
          <td>Uygulama mağazası onay gecikmesi</td>
          <td><span class="badge badge-low">Düşük</span></td>
          <td>Expo OTA güncelleme desteği</td>
          <td>Kritik güvenlik yamalarını OTA üzerinden dağıt</td>
        </tr>
        <tr>
          <td>A-05</td>
          <td>CORS kısıtlamaları nedeniyle istemci isteklerinin engellenmesi</td>
          <td><span class="badge badge-low">Düşük</span></td>
          <td>Yapılandırılabilir CORS origins; joker * kullanılmıyor</td>
          <td>Geliştirme ve üretim ortamları için ayrı .env dosyaları</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

<div class="page-break"></div>
${pageHeader('RAMS Analizi', 'M — Bakım / S — Güvenlik')}
<div class="content">
  <div class="section">
    <div class="section-title">M — Bakım Yapılabilirlik (Maintainability)</div>
    <p>Sistemde hata giderme, güncelleme ve yeni özellik eklemenin kolaylık derecesidir.</p>
    <table>
      <thead>
        <tr><th style="width:50px">ID</th><th>Gereksinim</th><th>Risk</th><th>Mevcut Durum</th><th>Öneri</th></tr>
      </thead>
      <tbody>
        <tr><td>M-01</td><td>Bağımlılık güncellemeleri</td><td><span class="badge badge-high">Yüksek</span></td><td>package-lock.json kilitleme mevcut</td><td>Dependabot veya Renovate otomasyonu kurulmalı</td></tr>
        <tr><td>M-02</td><td>Kod okunabilirliği</td><td><span class="badge badge-medium">Orta</span></td><td>TypeScript + ESLint yapılandırılmış; modüler klasör yapısı</td><td>JSDoc yorumları ve README güncel tutulmalı</td></tr>
        <tr><td>M-03</td><td>İçerik güncellemeleri</td><td><span class="badge badge-low">Düşük</span></td><td>Registry mimarisi ile tek noktadan içerik güncelleme</td><td>Admin paneli veya CMS entegrasyonu planlanabilir</td></tr>
        <tr><td>M-04</td><td>Veritabanı şema değişiklikleri</td><td><span class="badge badge-medium">Orta</span></td><td>Alembic migrasyon desteği kurulmuş</td><td>Her şema değişikliği için migrasyon dosyası oluşturulmalı</td></tr>
        <tr><td>M-05</td><td>Ortam yapılandırması</td><td><span class="badge badge-low">Düşük</span></td><td>.env.example şablon sağlanmış; Pydantic Settings merkezi</td><td>Docker Compose ile ortam standardizasyonu</td></tr>
        <tr><td>M-06</td><td>Otomatik test kapsamı</td><td><span class="badge badge-high">Yüksek</span></td><td>Henüz test yazılmamış</td><td>Backend için pytest; mobil için Jest + React Native Testing Library eklenmeli</td></tr>
        <tr><td>M-07</td><td>API versiyonlama</td><td><span class="badge badge-low">Düşük</span></td><td>Versiyonlama uygulanmamış</td><td>/v1/ prefix ile geriye dönük uyumluluk sağlanmalı</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">S — Güvenlik (Safety / Security)</div>
    <p>Sistemin zararlı saldırılara, veri ihlallerine ve kötüye kullanıma karşı dayanıklılığıdır.</p>
    <table>
      <thead>
        <tr><th style="width:50px">ID</th><th>Güvenlik Gereksinimi</th><th>Önem</th><th>Uygulanan Önlem</th></tr>
      </thead>
      <tbody>
        <tr><td>S-01</td><td>Şifre güvenliği</td><td><span class="badge badge-critical">Kritik</span></td><td>passlib + bcrypt ile güçlü hash; düz metin şifre saklanmıyor</td></tr>
        <tr><td>S-02</td><td>Kimlik doğrulama</td><td><span class="badge badge-critical">Kritik</span></td><td>JWT access (30 dk) + refresh (7 gün) token çifti; her yenilemede rotate</td></tr>
        <tr><td>S-03</td><td>Yetkisiz erişim engeli</td><td><span class="badge badge-critical">Kritik</span></td><td>Korumalı uç noktalarda Bearer token zorunlu; get_current_user bağımlılığı</td></tr>
        <tr><td>S-04</td><td>SQL enjeksiyonu</td><td><span class="badge badge-critical">Kritik</span></td><td>SQLAlchemy ORM ile parametrize sorgular; ham SQL kullanılmıyor</td></tr>
        <tr><td>S-05</td><td>Dosya yükleme güvenliği</td><td><span class="badge badge-high">Yüksek</span></td><td>MIME doğrulama + 10 MB sınırı + UUID ile rastgele dosya adlandırma</td></tr>
        <tr><td>S-06</td><td>CORS politikası</td><td><span class="badge badge-high">Yüksek</span></td><td>Yalnızca yapılandırılan origin'lere izin; joker * yok</td></tr>
        <tr><td>S-07</td><td>Hassas veri ifşası</td><td><span class="badge badge-high">Yüksek</span></td><td>Pydantic şemaları ile yanıtlarda şifre karması filtreleniyor</td></tr>
        <tr><td>S-08</td><td>Gizli anahtar yönetimi</td><td><span class="badge badge-medium">Orta</span></td><td>SECRET_KEY ve GEMINI_API_KEY .env'de; .gitignore ile git'ten hariç</td></tr>
        <tr><td>S-09</td><td>Rate limiting (kaba kuvvet)</td><td><span class="badge badge-medium">Orta</span></td><td>Henüz uygulanmamış</td></tr>
        <tr><td>S-10</td><td>KVKK uyumluluğu</td><td><span class="badge badge-medium">Orta</span></td><td>Yalnızca gerekli veriler saklanıyor; politika belgesi hazırlanmalı</td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Risk Özet Matrisi</div>
    <table>
      <thead><tr><th>RAMS Boyutu</th><th>Kritik</th><th>Yüksek</th><th>Orta</th><th>Düşük</th><th>Toplam</th></tr></thead>
      <tbody>
        <tr><td>Güvenilirlik (R)</td><td>0</td><td>2</td><td>3</td><td>2</td><td>7</td></tr>
        <tr><td>Erişilebilirlik (A)</td><td>0</td><td>1</td><td>2</td><td>2</td><td>5</td></tr>
        <tr><td>Bakım Yapılabilirlik (M)</td><td>0</td><td>2</td><td>2</td><td>3</td><td>7</td></tr>
        <tr><td>Güvenlik (S)</td><td>4</td><td>3</td><td>3</td><td>0</td><td>10</td></tr>
        <tr style="background:#fdf9f5;font-weight:700"><td>TOPLAM</td><td>4</td><td>8</td><td>10</td><td>7</td><td>29</td></tr>
      </tbody>
    </table>
  </div>

  <div class="doc-footer">
    <span>Harput Rehberi — RAMS Analizi</span>
    <span>Haziran 2026 · Fırat Üniversitesi</span>
  </div>
</div>
</body>
</html>`;

// ══════════════════════════════════════════════════════════════════════════════
// 3. THS_report.html
// ══════════════════════════════════════════════════════════════════════════════
const THS_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8"/>
  <style>${BASE_CSS}</style>
</head>
<body>

<div class="cover">
  <div class="cover-badge">Teknik Proje Belgesi</div>
  <div class="cover-icon">📊</div>
  <h1>TEKNİK DURUM RAPORU</h1>
  <h2>Harput Rehberi</h2>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <div class="cover-meta-row"><span class="cover-meta-label">Proje Adı</span><span class="cover-meta-value">Harput Rehberi Mobil Uygulaması</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Belge Türü</span><span class="cover-meta-value">Teknik Hazırlık ve İlerleme Raporu</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Üniversite</span><span class="cover-meta-value">Fırat Üniversitesi</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Bölüm</span><span class="cover-meta-value">Bilgisayar Mühendisliği</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Tarih</span><span class="cover-meta-value">Haziran 2026</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Sürüm</span><span class="cover-meta-value">v1.0</span></div>
  </div>
</div>

${pageHeader('Teknik Durum Raporu', 'Proje Özeti')}
<div class="content">
  <div class="section">
    <div class="section-title">Takım ve Proje</div>
    ${teamMeta()}
    <div class="info-box">
      <strong>Proje Kapsamı:</strong> Harput Rehberi, Türkiye'nin Elazığ iline bağlı tarihi Harput bölgesini ve Harput Kalesi'ni ziyaretçilere tanıtmak amacıyla geliştirilen çok platformlu bir mobil uygulamadır. Expo/React Native tabanlı mobil istemci ve FastAPI/Python tabanlı REST API sunucusundan oluşmaktadır.
    </div>
  </div>

  <div class="section">
    <div class="section-title">Sistem Mimarisi</div>
    <div class="arch-box">
      <div class="arch-box-header">📱 Mobil Katman (React Native / Expo)</div>
      <div class="arch-box-body">
        <div class="arch-row">
          <span class="arch-tag">Expo ~54.0</span>
          <span class="arch-tag">React Native 0.81.5</span>
          <span class="arch-tag">React 19.1.0</span>
          <span class="arch-tag">TypeScript ~5.9</span>
          <span class="arch-tag">Expo Router ~6.0</span>
          <span class="arch-tag">AsyncStorage</span>
        </div>
      </div>
    </div>
    <div class="arch-box">
      <div class="arch-box-header">🖥️ Backend Katmanı (FastAPI / Python)</div>
      <div class="arch-box-body">
        <div class="arch-row">
          <span class="arch-tag">FastAPI ≥0.115</span>
          <span class="arch-tag">SQLAlchemy 2.0 async</span>
          <span class="arch-tag">aiosqlite</span>
          <span class="arch-tag">Pydantic Settings</span>
          <span class="arch-tag">python-jose (JWT)</span>
          <span class="arch-tag">bcrypt</span>
          <span class="arch-tag">Google Gemini AI</span>
          <span class="arch-tag">Uvicorn</span>
        </div>
      </div>
    </div>
    <div class="arch-box">
      <div class="arch-box-header">🥽 AR / 3D Katmanı</div>
      <div class="arch-box-body">
        <div class="arch-row">
          <span class="arch-tag">Three.js ^0.184</span>
          <span class="arch-tag">@react-three/fiber ^9.6</span>
          <span class="arch-tag">expo-three ^7.0</span>
          <span class="arch-tag">@reactvision/react-viro ^2.55</span>
          <span class="arch-tag">expo-camera ~17.0</span>
          <span class="arch-tag">expo-gl ~16.0</span>
        </div>
      </div>
    </div>
    <div class="arch-box">
      <div class="arch-box-header">🗺️ Harita</div>
      <div class="arch-box-body">
        <div class="arch-row">
          <span class="arch-tag">react-native-maps 1.20.1</span>
          <span class="arch-tag">Planlandı: Gerçek zamanlı mekân koordinatları</span>
        </div>
      </div>
    </div>
  </div>
</div>

<div class="page-break"></div>
${pageHeader('Teknik Durum Raporu', 'Backend API')}
<div class="content">
  <div class="section">
    <div class="section-title">Backend API Uç Noktaları</div>
    <table>
      <thead><tr><th>Modül</th><th>Yöntem</th><th>Uç Nokta</th><th>Kimlik Doğrulama</th><th>Durum</th></tr></thead>
      <tbody>
        <tr><td>Auth</td><td>POST</td><td>/auth/register</td><td>❌</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Auth</td><td>POST</td><td>/auth/login</td><td>❌</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Auth</td><td>POST</td><td>/auth/refresh</td><td>❌</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Auth</td><td>GET</td><td>/auth/me</td><td>✅</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Auth</td><td>POST</td><td>/auth/logout</td><td>✅</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Galeri</td><td>GET</td><td>/gallery</td><td>❌</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Galeri</td><td>POST</td><td>/gallery/upload</td><td>✅</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Yorumlar</td><td>GET</td><td>/reviews/{slug}</td><td>❌</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Yorumlar</td><td>GET</td><td>/reviews/{slug}/summary</td><td>❌</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Yorumlar</td><td>POST</td><td>/reviews/{slug}</td><td>✅</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Asistan</td><td>POST</td><td>/assistant/chat</td><td>✅</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
        <tr><td>Sağlık</td><td>GET</td><td>/</td><td>❌</td><td><span class="badge badge-low">✅ Hazır</span></td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Veritabanı Şeması</div>
    <table>
      <thead><tr><th>Tablo</th><th>Sütun</th><th>Tür</th><th>Açıklama</th></tr></thead>
      <tbody>
        <tr><td>users</td><td>id</td><td>UUID (PK)</td><td>Otomatik UUID birincil anahtar</td></tr>
        <tr><td>users</td><td>username</td><td>VARCHAR(50) UNIQUE</td><td>Benzersiz kullanıcı adı</td></tr>
        <tr><td>users</td><td>email</td><td>VARCHAR(255) UNIQUE</td><td>Benzersiz e-posta</td></tr>
        <tr><td>users</td><td>hashed_password</td><td>TEXT</td><td>bcrypt ile şifrelenmiş parola</td></tr>
        <tr><td>users</td><td>is_active</td><td>BOOLEAN</td><td>Hesap aktif/pasif durumu</td></tr>
        <tr><td>gallery_images</td><td>id</td><td>UUID (PK)</td><td>Otomatik UUID birincil anahtar</td></tr>
        <tr><td>gallery_images</td><td>filename</td><td>VARCHAR UNIQUE</td><td>UUID ile rastgele dosya adı</td></tr>
        <tr><td>gallery_images</td><td>mime_type</td><td>VARCHAR(50)</td><td>Doğrulanmış dosya tipi</td></tr>
        <tr><td>gallery_images</td><td>size_bytes</td><td>INTEGER</td><td>Dosya boyutu (bayt)</td></tr>
        <tr><td>gallery_images</td><td>uploaded_by</td><td>UUID (FK → users)</td><td>Yükleyen kullanıcı</td></tr>
        <tr><td>reviews</td><td>id</td><td>UUID (PK)</td><td>Otomatik UUID birincil anahtar</td></tr>
        <tr><td>reviews</td><td>place_slug</td><td>VARCHAR(100)</td><td>Sabit mekân tanımlayıcısı (19 mekân)</td></tr>
        <tr><td>reviews</td><td>user_id</td><td>UUID (FK → users)</td><td>Yorum sahibi kullanıcı</td></tr>
        <tr><td>reviews</td><td>rating</td><td>INTEGER (1-5)</td><td>Puan (1 en düşük, 5 en yüksek)</td></tr>
        <tr><td>reviews</td><td>comment</td><td>TEXT (≤2000)</td><td>Opsiyonel yorum metni</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="page-break"></div>
${pageHeader('Teknik Durum Raporu', 'Mobil Ekranlar & Durum')}
<div class="content">
  <div class="section">
    <div class="section-title">Mobil Uygulama Ekranları</div>
    <table>
      <thead><tr><th>Ekran</th><th>Dosya</th><th>Açıklama</th><th>Durum</th></tr></thead>
      <tbody>
        <tr><td>Ana Sayfa</td><td>(tabs)/index.tsx</td><td>Tam ekran kahraman görsel, ziyaret özeti, dil seçimi</td><td><span class="badge badge-low">✅ Tamamlandı</span></td></tr>
        <tr><td>Harita</td><td>(tabs)/map.tsx</td><td>Mekân kart listesi, detay kaplama, kategori filtresi</td><td><span class="badge badge-low">✅ Tamamlandı</span></td></tr>
        <tr><td>Galeri</td><td>(tabs)/gallery.tsx</td><td>Görsel ızgarası, tam ekran görüntüleyici, backend entegrasyonu</td><td><span class="badge badge-low">✅ Tamamlandı</span></td></tr>
        <tr><td>Tarih</td><td>(tabs)/history.tsx</td><td>Bölüm bazlı içerikler, detay ekranı</td><td><span class="badge badge-low">✅ Tamamlandı</span></td></tr>
        <tr><td>Quiz</td><td>(tabs)/quiz.tsx</td><td>Zamanlı sorular, ilerleme kaydetme, sonuç takibi</td><td><span class="badge badge-low">✅ Tamamlandı</span></td></tr>
        <tr><td>AR</td><td>(tabs)/ar.tsx</td><td>Three.js + ViroCastleAr bileşeni, dinamik yükleme</td><td><span class="badge badge-medium">🔄 Geliştiriliyor</span></td></tr>
        <tr><td>Asistan</td><td>(tabs)/assistant.tsx</td><td>Gemini AI ile SSE akışlı sohbet</td><td><span class="badge badge-medium">🔄 Geliştiriliyor</span></td></tr>
        <tr><td>Lens</td><td>lens.tsx</td><td>Ayrı yığın rotası, kamera deneyimi</td><td><span class="badge badge-medium">🔄 Planlandı</span></td></tr>
      </tbody>
    </table>
  </div>

  <div class="section">
    <div class="section-title">Geliştirme Takvimi</div>
    <table>
      <thead><tr><th>Dönem</th><th>Süre</th><th>Tamamlanan Çalışmalar</th></tr></thead>
      <tbody>
        <tr><td>Planlama</td><td>Mart 2025 (2 hafta)</td><td>Proje kapsamı, teknoloji seçimi, görev dağılımı</td></tr>
        <tr><td>Mobil İskelet</td><td>Nisan 2025 (3 hafta)</td><td>Expo Router, ekran tasarımları, yerel JSON içerik sistemi</td></tr>
        <tr><td>Backend API</td><td>Nisan–Mayıs 2025 (3 hafta)</td><td>Auth, Galeri, Yorumlar modülleri</td></tr>
        <tr><td>AI Asistan</td><td>Mayıs 2025 (2 hafta)</td><td>Gemini API entegrasyonu, SSE akış sistemi</td></tr>
        <tr><td>AR Modülü</td><td>Mayıs–Haziran 2025 (3 hafta)</td><td>Three.js + Viro entegrasyonu (devam ediyor)</td></tr>
        <tr><td>İçerik & Test</td><td>Haziran 2025 (2 hafta)</td><td>İçerik tamamlama, hata düzeltme</td></tr>
        <tr><td>Sunum</td><td>Haziran 2025</td><td>Final sunumu ve proje teslimi</td></tr>
      </tbody>
    </table>
  </div>

  <div class="doc-footer">
    <span>Harput Rehberi — Teknik Durum Raporu</span>
    <span>Haziran 2026 · Fırat Üniversitesi</span>
  </div>
</div>
</body>
</html>`;

// ══════════════════════════════════════════════════════════════════════════════
// 4. Requirements.html
// ══════════════════════════════════════════════════════════════════════════════
const REQUIREMENTS_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8"/>
  <style>${BASE_CSS}
  .req-section { margin-bottom: 8px; }
  </style>
</head>
<body>

<div class="cover">
  <div class="cover-badge">Yazılım Mühendisliği Belgesi</div>
  <div class="cover-icon">📋</div>
  <h1>YAZILIM GEREKSİNİMLERİ</h1>
  <h2>Harput Rehberi</h2>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <div class="cover-meta-row"><span class="cover-meta-label">Proje Adı</span><span class="cover-meta-value">Harput Rehberi Mobil Uygulaması</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Belge Türü</span><span class="cover-meta-value">Yazılım Gereksinimleri Belgesi (SRS)</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Üniversite</span><span class="cover-meta-value">Fırat Üniversitesi</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Bölüm</span><span class="cover-meta-value">Bilgisayar Mühendisliği</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Tarih</span><span class="cover-meta-value">Haziran 2026</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Sürüm</span><span class="cover-meta-value">v1.0</span></div>
  </div>
</div>

${pageHeader('Yazılım Gereksinimleri', 'Giriş')}
<div class="content">
  <div class="section">
    <div class="section-title">Takım Bilgileri</div>
    ${teamMeta()}
    <div class="info-box">
      <strong>Belge Amacı:</strong> Bu Yazılım Gereksinimleri Belgesi (SRS), Harput Rehberi uygulamasının işlevsel ve işlevsel olmayan gereksinimlerini kapsamlı biçimde tanımlamaktadır. Belge; geliştirici ekibi, akademik değerlendiriciler ve proje paydaşları için temel referans kaynağıdır.
    </div>
  </div>

  <div class="section">
    <div class="section-title">Sistem Tanımı</div>
    <p>Harput Rehberi, iki ana bileşenden oluşmaktadır:</p>
    <div class="arch-box">
      <div class="arch-box-header">Bileşen 1 — Mobil Uygulama</div>
      <div class="arch-box-body"><p>React Native (Expo) tabanlı; Android ve iOS platformlarını destekler. Kullanıcıya doğrudan hizmet veren arayüz katmanıdır.</p></div>
    </div>
    <div class="arch-box">
      <div class="arch-box-header">Bileşen 2 — Backend API Sunucusu</div>
      <div class="arch-box-body"><p>FastAPI (Python) tabanlı REST API; kimlik doğrulama, galeri, yorum ve AI asistan servislerini sağlar.</p></div>
    </div>
  </div>
</div>

<div class="page-break"></div>
${pageHeader('Yazılım Gereksinimleri', 'İşlevsel Gereksinimler')}
<div class="content">
  <div class="section">
    <div class="section-title">İşlevsel Gereksinimler</div>

    <div class="section-subtitle">FR-01: Kimlik Doğrulama Sistemi</div>
    <div class="req-item"><span class="req-id">FR-01.1</span><span class="req-text">Sistem, kullanıcının kullanıcı adı, e-posta ve şifre ile kayıt olmasına izin vermelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-01.2</span><span class="req-text">Sistem, kullanıcı adı veya e-posta ile giriş yapılmasını desteklemelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-01.3</span><span class="req-text">Sistem, JWT access token (30 dk) ve refresh token (7 gün) çifti üretmelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-01.4</span><span class="req-text">Refresh token kullanımında yeni refresh token üretilmeli (rotate) ve eskisi geçersiz sayılmalıdır</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-01.5</span><span class="req-text">Aynı kullanıcı adı veya e-posta ile ikinci kayıt denemesinde HTTP 409 hatası dönmelidir</span><span class="req-priority medium">● Orta</span></div>

    <div class="section-subtitle">FR-02: Galeri Sistemi</div>
    <div class="req-item"><span class="req-id">FR-02.1</span><span class="req-text">Kimliği doğrulanmış kullanıcılar JPEG, PNG veya WEBP formatında görsel yükleyebilmelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-02.2</span><span class="req-text">Maksimum dosya yükleme boyutu 10 MB olmalıdır; aşıldığında HTTP 400 hatası dönmelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-02.3</span><span class="req-text">Galeri listeleme cursor tabanlı sayfalama ile çalışmalı; varsayılan sayfa boyutu 20 olmalıdır</span><span class="req-priority medium">● Orta</span></div>
    <div class="req-item"><span class="req-id">FR-02.4</span><span class="req-text">Yüklenen görseller sunucuda UUID ismiyle saklanmalı ve /media/ statik yolu üzerinden erişilebilir olmalıdır</span><span class="req-priority medium">● Orta</span></div>

    <div class="section-subtitle">FR-03: Yorum Sistemi</div>
    <div class="req-item"><span class="req-id">FR-03.1</span><span class="req-text">Kimliği doğrulanmış kullanıcılar tanımlanmış 19 mekândan herhangi birine 1–5 puan ve opsiyonel yorum ekleyebilmelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-03.2</span><span class="req-text">Her kullanıcı bir mekânı yalnızca bir kez değerlendirebilir; ikinci denemede HTTP 409 hatası dönmelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-03.3</span><span class="req-text">Herhangi bir kullanıcı mekânların ortalama puanını ve yorum sayısını sorgulayabilmelidir</span><span class="req-priority medium">● Orta</span></div>
    <div class="req-item"><span class="req-id">FR-03.4</span><span class="req-text">Yorumlar cursor tabanlı sayfalama ile sıra dışı (en yeni önce) listelenmelidir</span><span class="req-priority medium">● Orta</span></div>

    <div class="section-subtitle">FR-04: AI Asistan</div>
    <div class="req-item"><span class="req-id">FR-04.1</span><span class="req-text">Kimliği doğrulanmış kullanıcılar Harput hakkında sorular sorabilmeli; yanıtlar SSE akışı ile gerçek zamanlı iletilmelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-04.2</span><span class="req-text">Asistan yalnızca Harput ve Türk tarihi konularına yanıt vermeli; alakasız sorularda kibarca yönlendirmelidir</span><span class="req-priority medium">● Orta</span></div>
    <div class="req-item"><span class="req-id">FR-04.3</span><span class="req-text">GEMINI_API_KEY yapılandırılmamışsa uç nokta HTTP 503 hatası dönmelidir</span><span class="req-priority medium">● Orta</span></div>

    <div class="section-subtitle">FR-05: Mobil — Tarih ve İçerik</div>
    <div class="req-item"><span class="req-id">FR-05.1</span><span class="req-text">Uygulama Türkçe ve İngilizce dillerini desteklemelidir; dil cihaz üzerinde kalıcı olarak saklanmalıdır</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-05.2</span><span class="req-text">Tarih bölümleri ve mekân detayları, locale bazlı JSON içerik kayıt defterinden yüklenmelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-05.3</span><span class="req-text">Quiz modülü; zamanlı sorular, ilerleme kaydetme ve yeniden başlatma özelliklerini desteklemelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-05.4</span><span class="req-text">Kullanıcılar mekânları favori olarak işaretleyebilmeli, ziyaret durumunu kaydedebilmeli ve not ekleyebilmelidir</span><span class="req-priority medium">● Orta</span></div>

    <div class="section-subtitle">FR-06: AR Deneyimi</div>
    <div class="req-item"><span class="req-id">FR-06.1</span><span class="req-text">AR ekranı, cihazın kamerasına erişerek gerçek dünya üzerine 3D katman bindirmelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">FR-06.2</span><span class="req-text">AR modülü yüklenemediğinde hata mesajı ile birlikte kullanıcı bilgilendirilmelidir</span><span class="req-priority medium">● Orta</span></div>
  </div>
</div>

<div class="page-break"></div>
${pageHeader('Yazılım Gereksinimleri', 'İşlevsel Olmayan Gereksinimler')}
<div class="content">
  <div class="section">
    <div class="section-title">İşlevsel Olmayan Gereksinimler</div>

    <div class="section-subtitle">NFR-01: Performans</div>
    <div class="req-item"><span class="req-id">NFR-01.1</span><span class="req-text">API uç noktaları normal koşullarda 500ms içinde yanıt vermelidir</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">NFR-01.2</span><span class="req-text">Galeri görselleri expo-image ile önbelleklenmeli; tekrar yüklemede ağ isteği yapılmamalıdır</span><span class="req-priority medium">● Orta</span></div>
    <div class="req-item"><span class="req-id">NFR-01.3</span><span class="req-text">Mobil uygulama başlangıç süresi 3 saniyeyi geçmemelidir</span><span class="req-priority medium">● Orta</span></div>

    <div class="section-subtitle">NFR-02: Güvenlik</div>
    <div class="req-item"><span class="req-id">NFR-02.1</span><span class="req-text">Tüm şifreler bcrypt ile hashlenmelidir; düz metin şifre asla saklanmamalıdır</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">NFR-02.2</span><span class="req-text">Gizli anahtarlar (SECRET_KEY, GEMINI_API_KEY) .env dosyasında saklanmalı; kaynak koduna yazılmamalıdır</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">NFR-02.3</span><span class="req-text">CORS; yalnızca yapılandırılan origin'lere izin vermelidir; joker * kabul edilmemelidir</span><span class="req-priority high">● Yüksek</span></div>

    <div class="section-subtitle">NFR-03: Kullanılabilirlik</div>
    <div class="req-item"><span class="req-id">NFR-03.1</span><span class="req-text">Uygulama internet bağlantısı olmadan temel içeriklere (tarih, quiz, yerel galeri) erişim sunmalıdır</span><span class="req-priority high">● Yüksek</span></div>
    <div class="req-item"><span class="req-id">NFR-03.2</span><span class="req-text">UI; Android ve iOS için platform tasarım kılavuzlarına uygun olmalıdır</span><span class="req-priority medium">● Orta</span></div>
    <div class="req-item"><span class="req-id">NFR-03.3</span><span class="req-text">Dil değişimi uygulama yeniden başlatılmadan anında gerçekleşmelidir</span><span class="req-priority medium">● Orta</span></div>

    <div class="section-subtitle">NFR-04: Ölçeklenebilirlik</div>
    <div class="req-item"><span class="req-id">NFR-04.1</span><span class="req-text">Backend; SQLite'tan PostgreSQL'e geçiş yalnızca DATABASE_URL değişkeni güncellenerek yapılabilmelidir</span><span class="req-priority medium">● Orta</span></div>
    <div class="req-item"><span class="req-id">NFR-04.2</span><span class="req-text">İçerik kayıt defteri; yeni dil eklenmesi durumunda kod değişikliği gerektirmemelidir</span><span class="req-priority low">● Düşük</span></div>

    <div class="section-subtitle">NFR-05: Sürdürülebilirlik</div>
    <div class="req-item"><span class="req-id">NFR-05.1</span><span class="req-text">Tüm Python kodu PEP 8 kurallarına uymalı; TypeScript kodu ESLint kurallarını geçmelidir</span><span class="req-priority medium">● Orta</span></div>
    <div class="req-item"><span class="req-id">NFR-05.2</span><span class="req-text">Veritabanı şema değişiklikleri Alembic migrasyonları ile yönetilmelidir</span><span class="req-priority medium">● Orta</span></div>
  </div>

  <div class="section">
    <div class="section-title">Sistem Kısıtlamaları</div>
    <table>
      <thead><tr><th>Kısıt</th><th>Açıklama</th></tr></thead>
      <tbody>
        <tr><td>Platform</td><td>Mobil uygulama; Android 8.0+ ve iOS 13+ sürümlerini desteklemelidir</td></tr>
        <tr><td>Veritabanı</td><td>Geliştirme ortamında SQLite kullanılır; üretimde ilişkisel bir veritabanı önerilir</td></tr>
        <tr><td>AI API</td><td>Asistan özelliği Google Gemini API anahtarı gerektirir</td></tr>
        <tr><td>Dosya Boyutu</td><td>Tek bir görsel yüklemesi 10 MB'ı geçemez</td></tr>
        <tr><td>Token Süresi</td><td>Access token 30 dakika; refresh token 7 gün geçerlidir</td></tr>
        <tr><td>Yorum Kısıtı</td><td>Bir kullanıcı bir mekânı yalnızca bir kez değerlendirebilir</td></tr>
      </tbody>
    </table>
  </div>

  <div class="doc-footer">
    <span>Harput Rehberi — Yazılım Gereksinimleri Belgesi</span>
    <span>Haziran 2026 · Fırat Üniversitesi</span>
  </div>
</div>
</body>
</html>`;

// ══════════════════════════════════════════════════════════════════════════════
// 5. UserScenario.html
// ══════════════════════════════════════════════════════════════════════════════
const USERSCENARIO_HTML = `<!DOCTYPE html>
<html lang="tr">
<head>
  <meta charset="UTF-8"/>
  <style>${BASE_CSS}</style>
</head>
<body>

<div class="cover">
  <div class="cover-badge">Kullanıcı Deneyimi Belgesi</div>
  <div class="cover-icon">👤</div>
  <h1>KULLANICI SENARYOLARI</h1>
  <h2>Harput Rehberi</h2>
  <div class="cover-divider"></div>
  <div class="cover-meta">
    <div class="cover-meta-row"><span class="cover-meta-label">Proje Adı</span><span class="cover-meta-value">Harput Rehberi Mobil Uygulaması</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Belge Türü</span><span class="cover-meta-value">Kullanıcı Senaryoları</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Üniversite</span><span class="cover-meta-value">Fırat Üniversitesi</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Bölüm</span><span class="cover-meta-value">Bilgisayar Mühendisliği</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Tarih</span><span class="cover-meta-value">Haziran 2026</span></div>
    <div class="cover-meta-row"><span class="cover-meta-label">Sürüm</span><span class="cover-meta-value">v1.0</span></div>
  </div>
</div>

${pageHeader('Kullanıcı Senaryoları', 'Kullanıcı Personaları')}
<div class="content">
  <div class="section">
    <div class="section-title">Takım Bilgileri</div>
    ${teamMeta()}
  </div>

  <div class="section">
    <div class="section-title">Kullanıcı Personaları</div>
    <table>
      <thead><tr><th>Persona</th><th>Profil</th><th>Hedef</th><th>Teknik Düzey</th></tr></thead>
      <tbody>
        <tr><td>🧳 Ahmet (Turist)</td><td>35 yaşında, şehir dışından Harput'u ziyarete gelen bir öğretmen</td><td>Kaleyi ve tarihi mekânları keşfetmek, fotoğraf çekmek</td><td>Orta</td></tr>
        <tr><td>🎓 Zeynep (Öğrenci)</td><td>20 yaşında, Fırat Üniversitesi tarih bölümü öğrencisi</td><td>Harput tarihi hakkında derinlemesine bilgi edinmek ve quiz çözmek</td><td>Yüksek</td></tr>
        <tr><td>👴 Hasan Dede (Yerel)</td><td>68 yaşında, Elazığ'da doğup büyümüş emekli</td><td>Uygulamayı torunlarına Harput'u tanıtmak için kullanmak</td><td>Düşük</td></tr>
        <tr><td>📸 Lena (Yabancı Turist)</td><td>28 yaşında, Almanya'dan gelen gezgin fotoğrafçı</td><td>İngilizce içerikle mekânları keşfetmek, galeri fotoğrafı paylaşmak</td><td>Yüksek</td></tr>
        <tr><td>🏛️ Dr. Kadir (Akademisyen)</td><td>45 yaşında, arkeoloji araştırmacısı</td><td>AI asistanla tarihi konuları sorgulamak, detaylı bilgiye erişmek</td><td>Çok Yüksek</td></tr>
      </tbody>
    </table>
  </div>
</div>

<div class="page-break"></div>
${pageHeader('Kullanıcı Senaryoları', 'Senaryo 1–3')}
<div class="content">
  <div class="section">
    <div class="section-title">Kullanıcı Senaryoları</div>

    <div class="scenario-card">
      <div class="scenario-header">
        <div class="scenario-num">1</div>
        <div>
          <div class="scenario-title">İlk Ziyaret — Harput Kalesini Keşfetme</div>
          <div class="scenario-actor">Persona: Ahmet (Turist) · Ekran: Ana Sayfa → Harita → Mekân Detayı</div>
        </div>
      </div>
      <ul class="scenario-steps">
        <li>Ahmet uygulamayı ilk kez açar; ana sayfada tam ekran Harput Kalesi görseli ile karşılanır</li>
        <li>Ziyaret özeti sayacının 0/19 gösterdiğini fark eder; mekânları keşfetmeye karar verir</li>
        <li>Alt navigasyondan Harita sekmesine geçer; mekân kartlarını listede görür</li>
        <li>"Harput Kalesi" kartına dokunarak detay kaplamayı açar</li>
        <li>Mekânın fotoğraflarını, tarihi bilgisini ve konumunu inceler</li>
        <li>"Ziyaret Ettim" butonuna basar; ana sayfadaki sayaç 1/19'a güncellenir</li>
        <li>Mekânı favorilerine ekler ve kısa bir not yazar</li>
      </ul>
      <div class="scenario-meta">
        <span class="scenario-tag">Çevrimdışı: Evet</span>
        <span class="scenario-tag">Auth Gerekli: Hayır</span>
        <span class="scenario-tag">Sonuç: Başarılı</span>
      </div>
    </div>

    <div class="scenario-card">
      <div class="scenario-header">
        <div class="scenario-num">2</div>
        <div>
          <div class="scenario-title">Bilgi Yarışması — Quiz Çözme</div>
          <div class="scenario-actor">Persona: Zeynep (Öğrenci) · Ekran: Quiz</div>
        </div>
      </div>
      <ul class="scenario-steps">
        <li>Zeynep alt navigasyondan Quiz sekmesini açar</li>
        <li>Harput tarihi hakkında zamanlı sorularla karşılaşır</li>
        <li>5. soruda telefona gelmesi gerekir; uygulamayı arka plana atar</li>
        <li>Birkaç dakika sonra uygulamaya döner; quiz devam noktasından otomatik sürdürülür</li>
        <li>Tüm soruları tamamlar; sonuç ekranında puanını ve doğru cevapları görür</li>
        <li>Düşük puan aldığı konuları Tarih sekmesinden derinlemesine inceler</li>
        <li>Quiz'i yeniden başlatır ve daha yüksek puan almayı hedefler</li>
      </ul>
      <div class="scenario-meta">
        <span class="scenario-tag">Çevrimdışı: Evet</span>
        <span class="scenario-tag">Auth Gerekli: Hayır</span>
        <span class="scenario-tag">Sonuç: Başarılı</span>
      </div>
    </div>

    <div class="scenario-card">
      <div class="scenario-header">
        <div class="scenario-num">3</div>
        <div>
          <div class="scenario-title">Kayıt ve Fotoğraf Yükleme</div>
          <div class="scenario-actor">Persona: Lena (Yabancı Turist) · Ekran: Auth → Galeri</div>
        </div>
      </div>
      <ul class="scenario-steps">
        <li>Lena dil seçimini İngilizce olarak ayarlar; uygulama anında İngilizce'ye geçer</li>
        <li>Galeri sekmesinde fotoğraf yüklemek ister; sistemi giriş yapmaya yönlendirir</li>
        <li>Kayıt formunu doldurur: kullanıcı adı, e-posta ve şifre</li>
        <li>Başarıyla kayıt olur; JWT token çifti alır ve otomatik giriş yapılır</li>
        <li>Galeri'ye döner; kameradan çektiği Harput fotoğrafını yükler</li>
        <li>Yükleme başarılı; fotoğrafı galeri ızgarasının en üstünde görür</li>
        <li>Ulu Cami mekânına 5 yıldızlı yorum bırakır</li>
      </ul>
      <div class="scenario-meta">
        <span class="scenario-tag">Çevrimdışı: Hayır</span>
        <span class="scenario-tag">Auth Gerekli: Evet</span>
        <span class="scenario-tag">Sonuç: Başarılı</span>
      </div>
    </div>
  </div>
</div>

<div class="page-break"></div>
${pageHeader('Kullanıcı Senaryoları', 'Senaryo 4–6')}
<div class="content">
  <div class="section">

    <div class="scenario-card">
      <div class="scenario-header">
        <div class="scenario-num">4</div>
        <div>
          <div class="scenario-title">AI Asistan ile Tarihi Sorgulama</div>
          <div class="scenario-actor">Persona: Dr. Kadir (Akademisyen) · Ekran: Asistan</div>
        </div>
      </div>
      <ul class="scenario-steps">
        <li>Dr. Kadir uygulamada Asistan sekmesini açar (giriş yapmış durumda)</li>
        <li>"Harput Kalesi'nin Artuklu dönemindeki mimari özellikleri nelerdir?" sorusunu yazar</li>
        <li>Asistan, SSE akışı ile yanıtı gerçek zamanlı olarak kelime kelime iletir</li>
        <li>Yanıt tamamlandıktan sonra takip sorusu sorar: "Urartulardan kalan yapılar hakkında bilgi ver"</li>
        <li>Asistan konuya odaklı, tarihsel olarak doğru yanıtlar verir</li>
        <li>Tamamen alakasız bir soru sorar; asistan kibarca Harput konularına yönlendirir</li>
      </ul>
      <div class="scenario-meta">
        <span class="scenario-tag">Çevrimdışı: Hayır</span>
        <span class="scenario-tag">Auth Gerekli: Evet</span>
        <span class="scenario-tag">Sonuç: Başarılı</span>
      </div>
    </div>

    <div class="scenario-card">
      <div class="scenario-header">
        <div class="scenario-num">5</div>
        <div>
          <div class="scenario-title">AR Deneyimi — Kale Üzerinde 3D Katman</div>
          <div class="scenario-actor">Persona: Ahmet (Turist) · Ekran: AR</div>
        </div>
      </div>
      <ul class="scenario-steps">
        <li>Ahmet Harput Kalesi'nin önünde duruyor; AR sekmesini açar</li>
        <li>Uygulama kamera iznini ister; Ahmet izni onaylar</li>
        <li>Ekranda "AR kamera hazırlanıyor..." yükleme göstergesi belirir</li>
        <li>ViroCastleAr bileşeni yüklenir; kamera görüntüsü üzerine 3D katman bindirme başlar</li>
        <li>Kaleye kamerasını tuttuğunda yapının üzerine tarihsel bilgi etiketleri görür</li>
        <li>AR bileşeni yüklenemezse hata mesajı görüntülenir ve kullanıcı bilgilendirilir</li>
      </ul>
      <div class="scenario-meta">
        <span class="scenario-tag">Çevrimdışı: Kısmen</span>
        <span class="scenario-tag">Auth Gerekli: Hayır</span>
        <span class="scenario-tag">Durum: Geliştiriliyor</span>
      </div>
    </div>

    <div class="scenario-card">
      <div class="scenario-header">
        <div class="scenario-num">6</div>
        <div>
          <div class="scenario-title">Hata Senaryosu — İnternet Bağlantısı Yok</div>
          <div class="scenario-actor">Persona: Hasan Dede (Yerel) · Tüm Ekranlar</div>
        </div>
      </div>
      <ul class="scenario-steps">
        <li>Hasan Dede internet bağlantısı olmayan bir alanda uygulamayı açar</li>
        <li>Ana Sayfa, Tarih ve Quiz ekranları sorunsuz çalışır; yerel JSON içerikler gösterilir</li>
        <li>Galeri sekmesinde backend'den görsel yüklenemez; kullanıcıya hata mesajı gösterilir</li>
        <li>Asistan sekmesinde bağlantı hatası bildirilir; asistan kullanılamaz</li>
        <li>Bağlantı yeniden kurulduğunda uygulama otomatik olarak backend içeriklerini yeniler</li>
      </ul>
      <div class="scenario-meta">
        <span class="scenario-tag">Çevrimdışı: Kısmen</span>
        <span class="scenario-tag">Auth Gerekli: Hayır</span>
        <span class="scenario-tag">Sonuç: Kısmi Başarı</span>
      </div>
    </div>

  </div>

  <div class="section">
    <div class="section-title">Senaryo Özet Tablosu</div>
    <table>
      <thead><tr><th>Senaryo</th><th>Persona</th><th>Çevrimdışı</th><th>Auth</th><th>Durum</th></tr></thead>
      <tbody>
        <tr><td>1 — Mekân Keşfi</td><td>Ahmet (Turist)</td><td>✅ Evet</td><td>❌ Hayır</td><td><span class="badge badge-low">Uygulandı</span></td></tr>
        <tr><td>2 — Quiz Çözme</td><td>Zeynep (Öğrenci)</td><td>✅ Evet</td><td>❌ Hayır</td><td><span class="badge badge-low">Uygulandı</span></td></tr>
        <tr><td>3 — Fotoğraf Yükleme</td><td>Lena (Yabancı)</td><td>❌ Hayır</td><td>✅ Evet</td><td><span class="badge badge-low">Uygulandı</span></td></tr>
        <tr><td>4 — AI Asistan</td><td>Dr. Kadir</td><td>❌ Hayır</td><td>✅ Evet</td><td><span class="badge badge-low">Uygulandı</span></td></tr>
        <tr><td>5 — AR Deneyimi</td><td>Ahmet (Turist)</td><td>Kısmen</td><td>❌ Hayır</td><td><span class="badge badge-medium">Geliştiriliyor</span></td></tr>
        <tr><td>6 — Hata (Offline)</td><td>Hasan Dede</td><td>Kısmen</td><td>❌ Hayır</td><td><span class="badge badge-low">Uygulandı</span></td></tr>
      </tbody>
    </table>
  </div>

  <div class="doc-footer">
    <span>Harput Rehberi — Kullanıcı Senaryoları</span>
    <span>Haziran 2026 · Fırat Üniversitesi</span>
  </div>
</div>
</body>
</html>`;

// ══════════════════════════════════════════════════════════════════════════════
// PDF GENERATION
// ══════════════════════════════════════════════════════════════════════════════
const DOCS = [
  { name: 'SWOT', html: SWOT_HTML },
  { name: 'RAMS', html: RAMS_HTML },
  { name: 'THS_report', html: THS_HTML },
  { name: 'Requirements', html: REQUIREMENTS_HTML },
  { name: 'UserScenario', html: USERSCENARIO_HTML },
];

async function generate() {
  console.log('🚀 PDF oluşturma başlatılıyor...\n');

  const launchOptions = {
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
  };

  const commonPaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  ];
  for (const p of commonPaths) {
    if (fs.existsSync(p)) {
      launchOptions.executablePath = p;
      console.log(`Using system browser at: ${p}`);
      break;
    }
  }

  const browser = await puppeteer.launch(launchOptions);

  for (const doc of DOCS) {
    const outPath = path.join(OUT_DIR, `${doc.name}.pdf`);
    console.log(`📄 ${doc.name}.pdf oluşturuluyor...`);

    const page = await browser.newPage();

    // Write HTML to a temp file and load it
    const tmpHtml = path.join(OUT_DIR, `_tmp_${doc.name}.html`);
    fs.writeFileSync(tmpHtml, doc.html, 'utf8');

    await page.goto(`file:///${tmpHtml.replace(/\\/g, '/')}`, {
      waitUntil: 'networkidle0',
      timeout: 30000,
    });

    await page.pdf({
      path: outPath,
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    });

    await page.close();
    fs.unlinkSync(tmpHtml); // clean up temp file

    console.log(`   ✅ ${outPath}`);
  }

  await browser.close();
  console.log('\n🎉 Tüm PDFler başarıyla oluşturuldu!');
  console.log(`📁 Konum: ${OUT_DIR}`);
}

generate().catch((err) => {
  console.error('❌ Hata:', err.message);
  process.exit(1);
});
