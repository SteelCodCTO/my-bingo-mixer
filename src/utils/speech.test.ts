import { describe, it, expect, vi, afterEach } from 'vitest';
import { speakLine, cancelSpeech } from './speech';

class FakeUtterance {
  text: string;
  lang = '';
  pitch = 1;
  rate = 1;
  constructor(text: string) {
    this.text = text;
  }
}

function installFakeSpeech() {
  const synth = { speak: vi.fn(), cancel: vi.fn() };
  vi.stubGlobal('speechSynthesis', synth);
  vi.stubGlobal('SpeechSynthesisUtterance', FakeUtterance);
  return synth;
}

describe('speech', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns false without throwing when speech is unsupported', () => {
    expect(speakLine('Wicked!')).toBe(false);
    expect(() => cancelSpeech()).not.toThrow();
  });

  it('cancels any current line and speaks the new one', () => {
    const synth = installFakeSpeech();

    expect(speakLine('Wicked!')).toBe(true);

    expect(synth.cancel).toHaveBeenCalledTimes(1);
    expect(synth.speak).toHaveBeenCalledTimes(1);
    const utterance = synth.speak.mock.calls[0][0] as FakeUtterance;
    expect(utterance.text).toBe('Wicked!');
    expect(utterance.lang).toBe('en-US');
  });

  it('cancelSpeech stops speech', () => {
    const synth = installFakeSpeech();
    cancelSpeech();
    expect(synth.cancel).toHaveBeenCalledTimes(1);
  });
});
