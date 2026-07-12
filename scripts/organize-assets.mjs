import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const root = path.resolve(__dirname, '..');
const defaultZip = 'C:\\Прочее\\Фото для ИГР.zip';
const sourceZip = process.env.HMHA_SOURCE_ZIP || defaultZip;
const tempDir = path.join(root, '.tmp', 'asset-source');
const publicGamesDir = path.join(root, 'public', 'assets', 'games');
const unsortedDir = path.join(root, 'public', 'assets', 'unsorted');
const reportPath = path.join(root, 'src', 'data', 'asset-report.json');

const mappings = [
  { slug: 'baby-blues-nightmares', patterns: ['baby blues nightmare', 'baby blues nightmares'] },
  { slug: 'bad-toys-the-other-mission', patterns: ['bad toys the other mission'] },
  { slug: 'bokkie', patterns: ['bokkie'] },
  { slug: 'cakeys-twisted-bakery', patterns: ["cakey's twisted bakery", 'cakeys twisted bakery'] },
  { slug: 'care-of-dandan', patterns: ['care of dandan'] },
  { slug: 'care-of-gongon', patterns: ['care of gongon'] },
  { slug: 'casino-of-binbob', patterns: ['casino of binbob'] },
  { slug: 'circus-of-timtim', patterns: ['circus of timtim'] },
  { slug: 'goopys-industries', patterns: ['gloopy industries', 'goopy\'s industries', 'goopys industries'] },
  { slug: 'gregs-deadly-draft', patterns: ["greg's deadly draft", 'gregs deadly draft'] },
  { slug: 'happy-place', patterns: ['happy place'] },
  { slug: 'hollow-zone-legacy-of-lies', patterns: ['hollow zone legacy of lies'] },
  { slug: 'hospital-of-hanhan', patterns: ['hospital of hanhan'] },
  { slug: 'lemon', patterns: ['lemon'] },
  { slug: 'place-for-children', patterns: ['place for children'] },
  { slug: 'poppy-playtime-reborn', patterns: ['poppy playtime reborn'] },
  { slug: 'an-unknown-fall', patterns: ['an unknown fall', 'chapter 0'] },
  { slug: 'radiowave', patterns: ['radiowave'] },
  { slug: 'roys-rattlers-pizza-park', patterns: ["roy rattler's pizza park", 'roys rattlers pizza park'] },
  { slug: 'silent-mansion', patterns: ['silent mansion'] },
  { slug: 'the-hour-of-joy', patterns: ['the hour of joy', 'playtime.co the hour of joy demo'] }
];

const normalize = (value) =>
  value
    .toLowerCase()
    .replace(/[’'`"]/g, '')
    .replace(/[_—–-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const imageExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.bmp', '.avif']);

const ensureCleanDir = (dir) => {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
};

const expandZip = () => {
  if (!existsSync(sourceZip)) {
    throw new Error(`Source archive not found: ${sourceZip}`);
  }

  ensureCleanDir(tempDir);
  execFileSync(
    'powershell.exe',
    [
      '-NoProfile',
      '-Command',
      `Expand-Archive -LiteralPath '${sourceZip.replace(/'/g, "''")}' -DestinationPath '${tempDir.replace(/'/g, "''")}' -Force`
    ],
    { stdio: 'inherit' }
  );
};

const findImages = (dir) => {
  const items = [];
  const walk = (current) => {
    for (const entry of readDirSafe(current)) {
      const entryPath = path.join(current, entry);
      const stat = requireStats(entryPath);
      if (stat.isDirectory()) {
        walk(entryPath);
        continue;
      }
      if (imageExtensions.has(path.extname(entry).toLowerCase())) {
        items.push(entryPath);
      }
    }
  };
  walk(dir);
  return items;
};

const readDirSafe = (dir) => {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
};

const requireStats = (filePath) => statSync(filePath);

const matchSlug = (filename) => {
  const normalized = normalize(filename);
  const hit = mappings.find((mapping) => mapping.patterns.some((pattern) => normalized.includes(normalize(pattern))));
  return hit?.slug ?? null;
};

const toGameFileName = (index, ext) => {
  if (index === 0) return `cover${ext}`;
  if (index === 1) return `hero${ext}`;
  return `gallery-${String(index - 1).padStart(2, '0')}${ext}`;
};

const main = () => {
  expandZip();
  ensureCleanDir(publicGamesDir);
  ensureCleanDir(unsortedDir);

  const images = findImages(tempDir);
  const grouped = new Map();
  const unsorted = [];
  const manualReview = [];

  for (const filePath of images) {
    const fileName = path.basename(filePath);
    const slug = matchSlug(fileName);
    if (!slug) {
      unsorted.push(fileName);
      cpSync(filePath, path.join(unsortedDir, fileName));
      continue;
    }

    const fileList = grouped.get(slug) ?? [];
    fileList.push(filePath);
    grouped.set(slug, fileList);
    if (fileName.toLowerCase().includes('chapter 0') || fileName.toLowerCase().includes('demo')) {
      manualReview.push(`${fileName} -> ${slug}`);
    }
  }

  const report = {
    sourceZip,
    sourceFolder: tempDir,
    games: {},
    unsorted,
    manualReview
  };

  for (const [slug, fileList] of grouped.entries()) {
    const targetDir = path.join(publicGamesDir, slug);
    mkdirSync(targetDir, { recursive: true });
    const coverDir = path.join(targetDir, 'cover');
    const heroDir = path.join(targetDir, 'hero');
    const galleryDir = path.join(targetDir, 'gallery');
    mkdirSync(coverDir, { recursive: true });
    mkdirSync(heroDir, { recursive: true });
    mkdirSync(galleryDir, { recursive: true });

    const sorted = [...fileList].sort((a, b) => a.localeCompare(b, 'en'));
    const copied = [];

    sorted.forEach((filePath, index) => {
      const ext = path.extname(filePath).toLowerCase() || '.png';
      const fileName = toGameFileName(index, ext);
      const folder = index === 0 ? coverDir : index === 1 ? heroDir : galleryDir;
      const targetPath = path.join(folder, fileName);
      cpSync(filePath, targetPath);
      copied.push(path.relative(path.join(root, 'public'), targetPath).replace(/\\/g, '/'));
    });

    report.games[slug] = {
      mainImage: copied[0] ? `/${copied[0]}` : null,
      gallery: copied.slice(1).map((item) => `/${item}`)
    };
  }

  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, 'utf8');
  console.log(`Processed ${images.length} images.`);
  console.log(`Matched games: ${Object.keys(report.games).length}`);
  console.log(`Unsorted images: ${unsorted.length}`);
  console.log(`Report written to ${reportPath}`);
};

main();
