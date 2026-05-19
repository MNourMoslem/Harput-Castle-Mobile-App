import type { ImageSourcePropType } from 'react-native';

const FALLBACK_IMAGE = require('@/assets/images/map.webp');

const legacyImages = {
  'ocean-default': FALLBACK_IMAGE,
  'harput-castle': FALLBACK_IMAGE,
  'map-view': require('@/assets/images/map.webp'),
} as const;

const assetsImagesContext = require.context('../assets/images', true, /\.(png|jpe?g|webp)$/i);
const contentMediaContext = require.context('../data/content/media', true, /\.(png|jpe?g|webp)$/i);

function normalizeRelativePath(path: string): string {
  return path
    .replace(/\\/g, '/')
    .replace(/^\.+\//, '')
    .replace(/^\//, '');
}

function toUriSource(uri: string): ImageSourcePropType {
  return { uri };
}

function loadFromContext(contextRef: { keys: () => string[]; (path: string): unknown }, key: string): number | null {
  try {
    const mod = contextRef(key) as { default?: number } | number;
    return (typeof mod === 'number' ? mod : mod.default) ?? null;
  } catch {
    return null;
  }
}

function resolveRelativeImage(path: string): number | null {
  const normalized = normalizeRelativePath(path);

  const directContent = loadFromContext(contentMediaContext, `./${normalized}`);
  if (directContent) {
    return directContent;
  }

  const strippedMediaPrefix = normalized.replace(/^media\//, '');
  const mediaContent = loadFromContext(contentMediaContext, `./${strippedMediaPrefix}`);
  if (mediaContent) {
    return mediaContent;
  }

  const directAsset = loadFromContext(assetsImagesContext, `./${normalized}`);
  if (directAsset) {
    return directAsset;
  }

  const strippedAssetsPrefix = normalized.replace(/^assets\/images\//, '');
  const assetImage = loadFromContext(assetsImagesContext, `./${strippedAssetsPrefix}`);
  if (assetImage) {
    return assetImage;
  }

  return null;
}

export type ImageKey = keyof typeof legacyImages;

export function resolveImage(source: string): ImageSourcePropType {
  if (!source) {
    return FALLBACK_IMAGE;
  }

  if (/^https?:\/\//i.test(source)) {
    return toUriSource(source);
  }

  const legacy = legacyImages[source as ImageKey];
  if (legacy) {
    return legacy;
  }

  const local = resolveRelativeImage(source);
  if (local) {
    return local;
  }

  return FALLBACK_IMAGE;
}

export function getAllMediaImages(): ImageSourcePropType[] {
  const images: ImageSourcePropType[] = [];
  try {
    for (const key of contentMediaContext.keys()) {
      const source = loadFromContext(contentMediaContext, key);
      if (source !== null) {
        images.push(source as ImageSourcePropType);
      }
    }
  } catch (error) {
    // Ignore context errors
  }
  return images;
}

export default legacyImages;
