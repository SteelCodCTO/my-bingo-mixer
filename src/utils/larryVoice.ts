import { mascotAudioUrl } from './mascotAudio';
import { speakLine, cancelSpeech } from './speech';

let current: HTMLAudioElement | null = null;

export function stopLarry(): void {
  current?.pause();
  current = null;
  cancelSpeech();
}

export function playLarry(line: string): void {
  stopLarry();
  if (typeof Audio === 'undefined') {
    speakLine(line);
    return;
  }

  const audio = new Audio(mascotAudioUrl(line));
  current = audio;
  audio.play().catch((error: unknown) => {
    // Missing/unsupported clip: fall back to browser speech. Autoplay blocks would block speech too.
    if (current === audio && !(error instanceof DOMException && error.name === 'NotAllowedError')) {
      speakLine(line);
    }
  });
}
