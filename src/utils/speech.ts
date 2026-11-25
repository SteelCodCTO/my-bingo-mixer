const LARRY_PITCH = 1.3;
const LARRY_RATE = 1.05;

function getSynth(): SpeechSynthesis | null {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;
  if (typeof SpeechSynthesisUtterance === 'undefined') return null;
  return window.speechSynthesis;
}

export function speakLine(text: string): boolean {
  const synth = getSynth();
  if (!synth) return false;

  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'en-US';
  utterance.pitch = LARRY_PITCH;
  utterance.rate = LARRY_RATE;
  synth.speak(utterance);
  return true;
}

export function cancelSpeech(): void {
  getSynth()?.cancel();
}
