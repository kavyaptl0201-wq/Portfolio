export interface CaptionEntry {
  title?: string;
  caption?: string;
  year?: string | number;
  location?: string;
}

export interface GalleryItem {
  id: string;
  index: number;
  filename: string;
  url: string;
  type: 'image' | 'video';
  title: string;
  caption?: string;
  year?: string | number;
  location?: string;
  isDemo: boolean;
}

const TOTAL_PHOTOS = 16;

// Photos dropped into src/assets/photography/ are picked up automatically, sorted by file name
const files = import.meta.glob('../assets/photography/*.{jpg,jpeg,png,webp,avif}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

export function getGalleryItems(): GalleryItem[] {
  const paths = Object.keys(files).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // No photos yet: empty glass cards keep the ring full
  if (paths.length === 0) {
    return Array.from({ length: TOTAL_PHOTOS }, (_, i) => ({
      id: `demo-${i + 1}`,
      index: i + 1,
      filename: '',
      url: '',
      type: 'image' as const,
      title: `Frame ${String(i + 1).padStart(2, '0')}`,
      isDemo: true,
    }));
  }

  return paths.map((path, i) => {
    const filename = path.split('/').pop() || '';
    return {
      id: `photo-${i + 1}`,
      index: i + 1,
      filename,
      url: files[path],
      type: 'image' as const,
      title: `Frame ${String(i + 1).padStart(2, '0')}`,
      isDemo: false,
    };
  });
}
