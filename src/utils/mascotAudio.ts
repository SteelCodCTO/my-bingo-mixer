export const MASCOT_AUDIO_EXT = 'mp3';

export function mascotAudioSlug(line: string): string {
  return line
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function mascotAudioUrl(line: string, base: string = import.meta.env.BASE_URL): string {
  return `${base}audio/larry/${mascotAudioSlug(line)}.${MASCOT_AUDIO_EXT}`;
}
