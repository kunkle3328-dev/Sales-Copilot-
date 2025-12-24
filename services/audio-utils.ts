export const AudioUtils = {
  /**
   * Converts Float32Array audio data to Int16Array PCM data.
   * This is required because Gemini Live API expects raw PCM 16-bit audio.
   */
  float32ToInt16: (float32Array: Float32Array): Int16Array => {
    const int16Array = new Int16Array(float32Array.length);
    for (let i = 0; i < float32Array.length; i++) {
      const s = Math.max(-1, Math.min(1, float32Array[i]));
      int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return int16Array;
  },

  /**
   * Encodes an Int16Array (PCM) to a base64 string.
   * We do this manually to avoid external dependencies like js-base64.
   */
  arrayBufferToBase64: (buffer: ArrayBuffer): string => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  },

  /**
   * Decodes a base64 string to a Uint8Array.
   */
  base64ToUint8Array: (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  }
};