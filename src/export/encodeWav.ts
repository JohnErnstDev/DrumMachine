/**
 * Encodes an AudioBuffer as a standard 16-bit PCM WAV Blob.
 * Trailing silence is trimmed automatically (with a short 50ms margin).
 */
export function encodeWav(audioBuffer: AudioBuffer): Blob {
  const numChannels   = audioBuffer.numberOfChannels;
  const sampleRate    = audioBuffer.sampleRate;
  const numSamples    = lastAudibleSample(audioBuffer);
  const bitsPerSample = 16;
  const bytesPerSample = bitsPerSample / 8;
  const blockAlign    = numChannels * bytesPerSample;
  const byteRate      = sampleRate * blockAlign;
  const dataSize      = numSamples * blockAlign;
  const fileBuffer    = new ArrayBuffer(44 + dataSize);
  const view          = new DataView(fileBuffer);

  // ── RIFF chunk ──────────────────────────────────────────────────────────
  writeAscii(view, 0,  'RIFF');
  view.setUint32(4,  36 + dataSize, true);  // file size − 8
  writeAscii(view, 8,  'WAVE');

  // ── fmt sub-chunk ────────────────────────────────────────────────────────
  writeAscii(view, 12, 'fmt ');
  view.setUint32(16, 16, true);             // sub-chunk size (PCM = 16)
  view.setUint16(20, 1,  true);             // audio format  (1 = PCM)
  view.setUint16(22, numChannels,  true);
  view.setUint32(24, sampleRate,   true);
  view.setUint32(28, byteRate,     true);
  view.setUint16(32, blockAlign,   true);
  view.setUint16(34, bitsPerSample, true);

  // ── data sub-chunk ───────────────────────────────────────────────────────
  writeAscii(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave samples, clamped to [-1, 1] → 16-bit signed integer
  let offset = 44;
  for (let i = 0; i < numSamples; i++) {
    for (let ch = 0; ch < numChannels; ch++) {
      const sample = audioBuffer.getChannelData(ch)[i];
      const clamped = Math.max(-1, Math.min(1, sample));
      view.setInt16(offset, clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff, true);
      offset += bytesPerSample;
    }
  }

  return new Blob([fileBuffer], { type: 'audio/wav' });
}

function writeAscii(view: DataView, offset: number, text: string): void {
  for (let i = 0; i < text.length; i++) {
    view.setUint8(offset + i, text.charCodeAt(i));
  }
}

/**
 * Scans backward to find the last sample above the audibility threshold,
 * then adds a 50ms margin so the tail isn't hard-clipped.
 * Threshold is ~−80 dBFS.
 */
function lastAudibleSample(buffer: AudioBuffer, threshold = 0.0001): number {
  const margin = Math.ceil(buffer.sampleRate * 0.05); // 50 ms

  for (let i = buffer.length - 1; i >= 0; i--) {
    for (let ch = 0; ch < buffer.numberOfChannels; ch++) {
      if (Math.abs(buffer.getChannelData(ch)[i]) > threshold) {
        return Math.min(i + margin, buffer.length);
      }
    }
  }
  // Completely silent — return a minimal length
  return Math.min(margin, buffer.length);
}

/** Creates a temporary anchor element and triggers a file download. */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
