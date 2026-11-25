#!/usr/bin/env bash
# Idempotent Piper TTS setup for Larry's voice clips. Prints env exports on success.
set -euo pipefail

VENV="${PIPER_VENV:-/tmp/piper-venv}"
VOICES="${PIPER_VOICES:-/tmp/piper-voices}"
VOICE="${PIPER_VOICE:-en_US-ryan-high}"

command -v afconvert >/dev/null || { echo "afconvert not found (macOS only)" >&2; exit 1; }

if [[ ! -x "$VENV/bin/piper" ]]; then
  python3 -m venv "$VENV"
  "$VENV/bin/pip" install -q --upgrade pip
  "$VENV/bin/pip" install -q piper-tts
fi

if [[ ! -f "$VOICES/$VOICE.onnx" ]]; then
  mkdir -p "$VOICES"
  (cd "$VOICES" && "$VENV/bin/python" -m piper.download_voices --download-dir "$VOICES" "$VOICE")
fi

echo "export PIPER_BIN=$VENV/bin/piper"
echo "export PIPER_MODEL=$VOICES/$VOICE.onnx"
