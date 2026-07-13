import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import XLSX from 'xlsx';

const root = process.cwd();
const importDir = path.join(root, 'data-import');
const publicImportDir = path.join(root, 'public', 'data-import');
const libraryPath = path.join(root, 'src', 'data', 'library.ts');
const versionWords = /\b(demo|prologue|classic|old|remake|chapter\s*\d+|v\s*\d+(?:\.\d+)?|cancelled)\b/i;

const normalize = (value) => String(value ?? '')
  .normalize('NFKD')
  .toLowerCase()
  .replace(/[–—]/g, '-')
  .replace(/['’]/g, '')
  .replace(/[^a-z0-9а-яё]+/gi, ' ')
  .trim()
  .replace(/\s+/g, ' ');

const slugify = (value) => normalize(value).replace(/ё/g, 'е').replace(/\s+/g, '-');
const clean = (value) => value === null || value === undefined || String(value).trim() === '' ? null : String(value).trim();
const splitList = (value) => clean(value)?.split(/[,;/\n]+/).map((item) => item.trim()).filter(Boolean) ?? [];
const boolFromCell = (value) => /^(да|yes|true|1)$/i.test(String(value ?? '').trim());
const rating = (value) => {
  const number = Number(value);
  return Number.isFinite(number) && number >= 0 && number <= 10 ? number : null;
};
const canonicalUrl = (value) => {
  const raw = clean(value);
  if (!raw) return null;
  try {
    const url = new URL(raw);
    return `${url.hostname.replace(/^www\./, '').toLowerCase()}${url.pathname.replace(/\/$/, '').toLowerCase()}`;
  } catch {
    return normalize(raw);
  }
};

const aliases = {
  title: ['название', 'игра', 'title', 'game'],
  type: ['тип', 'type'],
  fanUniverse: ['фан вселенная серия', 'вселенная', 'серия', 'fan universe'],
  store: ['площадка', 'магазин', 'store'],
  status: ['статус', 'status'],
  price: ['цена', 'price'],
  platforms: ['платформа', 'платформы', 'platform'],
  duration: ['длительность', 'duration'],
  tags: ['теги', 'tags'],
  streamRating: ['для стрима 1 10', 'для стрима', 'stream'],
  clipsRating: ['потенциал клипов 1 10', 'потенциал клипов', 'clips'],
  comment: ['почему стоит снять', 'комментарий', 'comment'],
  url: ['ссылка', 'url', 'link'],
  completed: ['пройдено', 'completed'],
  streamed: ['стрим проведён', 'стрим проведен', 'streamed'],
  videoReady: ['видео готово', 'video ready'],
  personalRating: ['моя оценка', 'personal rating']
};

const findHeader = (rows) => {
  let best = null;
  rows.slice(0, 30).forEach((row, index) => {
    const cells = row.map(normalize);
    const map = {};
    let score = 0;
    for (const [field, names] of Object.entries(aliases)) {
      const column = cells.findIndex((cell) => names.some((name) => cell === normalize(name)));
      if (column >= 0) {
        map[field] = column;
        score += field === 'title' ? 4 : 1;
      }
    }
    if (map.title !== undefined && score >= 7 && (!best || score > best.score)) best = { index, map, score };
  });
  return best;
};

const getCell = (row, map, field) => map[field] === undefined ? null : row[map[field]];
const statusFrom = (value) => {
  const text = normalize(value);
  if (text.includes('демо')) return 'demo';
  if (text.includes('пролог')) return 'prologue';
  if (text.includes('отмен')) return 'cancelled';
  if (text.includes('ранн') || text.includes('early')) return 'early_access';
  if (text.includes('разработ') || text.includes('проект') || text.includes('ремейк') || text.includes('фан глава')) return 'in_development';
  if (text.includes('релиз')) return 'release';
  return 'unknown';
};
const priceFrom = (value) => {
  const text = normalize(value);
  if (text.includes('бесплат')) return 'free';
  if (text.includes('платн') || /\$|€|₽/.test(String(value ?? ''))) return 'paid';
  return 'unknown';
};

const sourceCandidates = [path.join(root, 'Hidden_Mascot_Horror_50_Games.xlsx'), path.join(importDir, 'Hidden_Mascot_Horror_50_Games.xlsx')];
const excelPath = sourceCandidates.find(fs.existsSync);
if (!excelPath) {
  throw new Error('Excel-файл не найден. Поместите Hidden_Mascot_Horror_50_Games.xlsx в корень проекта или data-import/.');
}

fs.mkdirSync(importDir, { recursive: true });
fs.mkdirSync(publicImportDir, { recursive: true });

const libraryText = fs.readFileSync(libraryPath, 'utf8');
const existing = [...libraryText.matchAll(/createGame\(\{([\s\S]*?)\n\s*\}\),?/g)]
  .map((match) => {
    const slug = match[1].match(/slug:\s*(['"])(.*?)\1/)?.[2];
    const title = match[1].match(/title:\s*(['"])(.*?)\1/)?.[2];
    const developerId = match[1].match(/developerId:\s*(['"])(.*?)\1/)?.[2] ?? null;
    const seriesId = match[1].match(/seriesId:\s*(['"])(.*?)\1/)?.[2] ?? null;
    return slug && title ? { slug, title, developerId, seriesId, normalizedTitle: normalize(title) } : null;
  })
  .filter(Boolean);

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif']);
const imageRoots = [path.join(root, 'public', 'assets', 'games'), path.join(root, 'public', 'assets', 'unsorted'), importDir, path.join(root, 'Фото для ИГР')];
const imageFiles = [];
const walk = (directory) => {
  if (!fs.existsSync(directory)) return;
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const full = path.join(directory, entry.name);
    if (entry.isDirectory()) walk(full);
    else if (imageExtensions.has(path.extname(entry.name).toLowerCase())) imageFiles.push(full);
  }
};
imageRoots.forEach(walk);

const publicPath = (file) => file.startsWith(path.join(root, 'public')) ? `/${path.relative(path.join(root, 'public'), file).replaceAll('\\', '/')}` : null;
const findImages = (title, slug) => {
  const candidates = imageFiles.filter((file) => {
    const relative = path.relative(root, file).replaceAll('\\', '/');
    const gameFolder = relative.match(/^public\/assets\/games\/([^/]+)\//i)?.[1];
    if (gameFolder) return gameFolder === slug;
    const fileTitle = normalize(path.basename(file, path.extname(file)));
    return fileTitle.length >= 5 && fileTitle === normalize(title);
  });
  const usable = candidates.map(publicPath).filter(Boolean);
  const cover = usable.find((file) => /\/cover\//.test(file)) ?? usable[0] ?? null;
  const hero = usable.find((file) => /\/hero\//.test(file)) ?? null;
  return { cover, hero, gallery: usable.filter((file) => file !== cover && file !== hero), matchedCount: usable.length };
};

const workbook = XLSX.readFile(excelPath, { cellDates: true });
const records = [];
const sheetReport = [];
for (const sheetName of workbook.SheetNames) {
  const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: null, raw: false });
  const header = findHeader(rows);
  if (!header) {
    sheetReport.push({ sheet: sheetName, rows: rows.length, importedRows: 0, warning: 'Не найдена строка заголовков игр.' });
    continue;
  }
  let importedRows = 0;
  rows.slice(header.index + 1).forEach((row, offset) => {
    const title = clean(getCell(row, header.map, 'title'));
    if (!title) return;
    importedRows += 1;
    records.push({
      sourceSheet: sheetName,
      sourceRow: header.index + offset + 2,
      title,
      normalizedTitle: normalize(title),
      proposedSlug: slugify(title),
      type: normalize(getCell(row, header.map, 'type')).includes('фан') ? 'fan_game' : 'original',
      fanUniverse: clean(getCell(row, header.map, 'fanUniverse')),
      storePlatforms: splitList(getCell(row, header.map, 'store')),
      status: statusFrom(getCell(row, header.map, 'status')),
      sourceStatus: clean(getCell(row, header.map, 'status')),
      priceType: priceFrom(getCell(row, header.map, 'price')),
      sourcePrice: clean(getCell(row, header.map, 'price')),
      platforms: splitList(getCell(row, header.map, 'platforms')),
      durationMinutes: null,
      sourceDuration: clean(getCell(row, header.map, 'duration')),
      tags: splitList(getCell(row, header.map, 'tags')),
      legacyRatings: { streamPotential: rating(getCell(row, header.map, 'streamRating')), clipsPotential: rating(getCell(row, header.map, 'clipsRating')), source: 'excel_v1' },
      comment: clean(getCell(row, header.map, 'comment')),
      sourceUrl: clean(getCell(row, header.map, 'url')),
      userState: {
        completed: boolFromCell(getCell(row, header.map, 'completed')),
        streamed: boolFromCell(getCell(row, header.map, 'streamed')),
        videoReady: boolFromCell(getCell(row, header.map, 'videoReady')),
        personalRating: rating(getCell(row, header.map, 'personalRating'))
      },
      source: 'excel_import', verificationStatus: 'unverified', ratingConfidence: 'low', editorialRatings: null,
      importedAt: new Date().toISOString(), needsManualReview: true, contentCategory: null, curationStatus: 'pending', curationReason: null,
      warnings: []
    });
  });
  sheetReport.push({ sheet: sheetName, rows: rows.length, headerRow: header.index + 1, importedRows });
}

const duplicateGroups = new Map();
for (const record of records) {
  const key = record.normalizedTitle;
  duplicateGroups.set(key, [...(duplicateGroups.get(key) ?? []), record]);
}

for (const record of records) {
  const exact = existing.find((game) => game.normalizedTitle === record.normalizedTitle || game.slug === record.proposedSlug);
  const sameUrl = records.filter((other) => other !== record && canonicalUrl(other.sourceUrl) && canonicalUrl(other.sourceUrl) === canonicalUrl(record.sourceUrl));
  const fuzzy = existing.filter((game) => {
    const left = record.normalizedTitle.replace(versionWords, '').trim();
    const right = game.normalizedTitle.replace(versionWords, '').trim();
    return left.length >= 5 && (left.includes(right) || right.includes(left));
  });
  record.existingMatch = exact ?? null;
  record.possibleDuplicates = [...new Set([...sameUrl.map((item) => item.title), ...fuzzy.map((item) => item.title)])];
  record.images = findImages(record.title, exact?.slug ?? record.proposedSlug);

  if (exact) {
    record.decision = 'duplicate';
    record.curationReason = `Игра уже присутствует в каталоге как ${exact.title}.`;
  } else if ((duplicateGroups.get(record.normalizedTitle)?.length ?? 0) > 1 || sameUrl.length > 0) {
    record.decision = 'needs_review';
    record.curationReason = 'Возможный дубликат внутри Excel; автоматическое объединение отключено.';
  } else if (/(парод|мем|стран|абсурд|юмор|смеш)/i.test(`${record.tags.join(' ')} ${record.comment ?? ''}`)) {
    record.decision = 'experimental';
    record.curationStatus = 'experimental';
    record.contentCategory = 'experimental';
    record.curationReason = 'В Excel игра описана как пародийная или необычная; качество сборки требует ручной проверки.';
  } else {
    record.decision = 'needs_review';
    record.curationReason = 'Нет независимой проверки страницы, сборки и качества; оценки Excel не считаются подтверждёнными.';
  }
  if (!record.sourceUrl) record.warnings.push('Нет ссылки.');
  if (record.images.matchedCount === 0) record.warnings.push('Локальные изображения не найдены.');
  if (record.possibleDuplicates.length && !exact) record.warnings.push('Найдены похожие названия; версии не объединены.');
}

const uniqueRecords = records.filter((record, index) => records.findIndex((other) => other.normalizedTitle === record.normalizedTitle && canonicalUrl(other.sourceUrl) === canonicalUrl(record.sourceUrl)) === index);
const byDecision = (decision) => records.filter((record) => record.decision === decision);
const duplicateRecords = records.filter((record) => record.decision === 'duplicate' || record.possibleDuplicates.length > 0);
const rejected = byDecision('rejected').map((record) => ({ title: record.title, sourceUrl: record.sourceUrl, decision: 'rejected', reason: record.curationReason, reviewedAt: record.importedAt, confidence: 'low' }));
const report = {
  generatedAt: new Date().toISOString(), sourceFile: path.relative(root, excelPath).replaceAll('\\', '/'), sheets: sheetReport,
  summary: {
    rowsFound: records.length, uniqueGames: uniqueRecords.length, existingGames: byDecision('duplicate').length,
    recommended: byDecision('recommended').length, experimental: byDecision('experimental').length,
    needsReview: byDecision('needs_review').length, rejected: rejected.length, unavailable: byDecision('unavailable').length,
    matchedImages: records.reduce((sum, record) => sum + record.images.matchedCount, 0)
  },
  checks: {
    emptyTitlesSkipped: true,
    exactDuplicateGroups: [...duplicateGroups.values()].filter((items) => items.length > 1).map((items) => items.map((item) => item.title)),
    versionedTitlesKeptSeparate: records.filter((record) => versionWords.test(record.title)).map((record) => record.title),
    publicCatalogModified: false
  },
  uncertain: records.filter((record) => record.warnings.length || record.decision === 'needs_review').map((record) => ({ title: record.title, sourceUrl: record.sourceUrl, warnings: record.warnings, reason: record.curationReason }))
};

const outputs = {
  'imported-games.json': records,
  'import-report.json': report,
  'rejected-games.json': rejected,
  'duplicate-games.json': duplicateRecords,
  'review-queue.json': records.filter((record) => record.decision === 'needs_review')
};
for (const [name, data] of Object.entries(outputs)) {
  const json = `${JSON.stringify(data, null, 2)}\n`;
  fs.writeFileSync(path.join(importDir, name), json);
  fs.writeFileSync(path.join(publicImportDir, name), json);
}

const legacyRatingsBySlug = Object.fromEntries(records
  .filter((record) => record.existingMatch?.slug)
  .map((record) => [record.existingMatch.slug, {
    ...record.legacyRatings,
    sourceTitle: record.title,
    importedAt: record.importedAt
  }]));
fs.writeFileSync(path.join(root, 'src', 'data', 'legacy-ratings.json'), `${JSON.stringify(legacyRatingsBySlug, null, 2)}\n`);

console.log(JSON.stringify(report.summary, null, 2));
