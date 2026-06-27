const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const DEBUG_SERVER_URL = "http://127.0.0.1:7777/event";
const DEBUG_SESSION_ID = "voice-no-response";

type ChunkHandler = (pcmChunk: Blob) => void;

export type MicrophonePcmStream = {
  stop: () => Promise<void>;
};

function getAudioContextCtor() {
  return window.AudioContext || (window as typeof window & {
    webkitAudioContext?: typeof AudioContext;
  }).webkitAudioContext;
}

function base64ToUint8Array(base64: string) {
  const binary = window.atob(base64);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes;
}

function downsampleFloat32ToInt16(
  input: Float32Array,
  inputSampleRate: number,
  targetSampleRate: number,
) {
  if (inputSampleRate === targetSampleRate) {
    const pcm = new Int16Array(input.length);
    for (let index = 0; index < input.length; index += 1) {
      const sample = Math.max(-1, Math.min(1, input[index]));
      pcm[index] = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
    }
    return pcm;
  }

  const ratio = inputSampleRate / targetSampleRate;
  const outputLength = Math.max(1, Math.round(input.length / ratio));
  const output = new Int16Array(outputLength);
  let offset = 0;

  for (let index = 0; index < outputLength; index += 1) {
    const nextOffset = Math.min(input.length, Math.round((index + 1) * ratio));
    let accumulator = 0;
    let count = 0;

    while (offset < nextOffset) {
      accumulator += input[offset];
      count += 1;
      offset += 1;
    }

    const sample = count > 0 ? accumulator / count : 0;
    const clamped = Math.max(-1, Math.min(1, sample));
    output[index] = clamped < 0 ? clamped * 0x8000 : clamped * 0x7fff;
  }

  return output;
}

function parseSampleRate(mimeType?: string) {
  const match = mimeType?.match(/rate=(\d+)/i);
  const parsed = match ? Number(match[1]) : Number.NaN;
  return Number.isFinite(parsed) ? parsed : OUTPUT_SAMPLE_RATE;
}

// #region debug-point A:audio-report
function reportVoiceAudioDebug(hypothesisId: string, msg: string, data?: Record<string, unknown>) {
  if (!(window as typeof window & { __VOICE_DEBUG__?: boolean }).__VOICE_DEBUG__) {
    return;
  }
  fetch(DEBUG_SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: "pre-fix",
      hypothesisId,
      location: "src/components/GeminiAssistant/audio.ts",
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now(),
    }),
  }).catch(() => undefined);
}
// #endregion

export async function startMicrophonePcmStream(
  onChunk: ChunkHandler,
): Promise<MicrophonePcmStream> {
  const AudioContextCtor = getAudioContextCtor();
  if (!AudioContextCtor) {
    throw new Error("AudioContext n'est pas disponible sur cet appareil.");
  }

  // #region debug-point A:mic-request
  reportVoiceAudioDebug("A", "Demande de permission microphone");
  // #endregion
  const mediaStream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
  // #region debug-point A:mic-granted
  reportVoiceAudioDebug("A", "Permission microphone accordee", {
    tracks: mediaStream.getAudioTracks().length,
    trackState: mediaStream.getAudioTracks()[0]?.readyState,
  });
  // #endregion

  const audioContext = new AudioContextCtor();
  await audioContext.resume();
  // #region debug-point A:audio-context
  reportVoiceAudioDebug("A", "AudioContext pret", {
    sampleRate: audioContext.sampleRate,
    state: audioContext.state,
  });
  // #endregion

  const source = audioContext.createMediaStreamSource(mediaStream);
  const processor = audioContext.createScriptProcessor(4096, 1, 1);
  const silentGain = audioContext.createGain();
  silentGain.gain.value = 0;

  let chunkCount = 0;
  let nonSilentChunkCount = 0;
  processor.onaudioprocess = (event) => {
    const channelData = event.inputBuffer.getChannelData(0);
    let peak = 0;
    for (let index = 0; index < channelData.length; index += 1) {
      peak = Math.max(peak, Math.abs(channelData[index] ?? 0));
    }
    const pcm16 = downsampleFloat32ToInt16(
      channelData,
      audioContext.sampleRate,
      INPUT_SAMPLE_RATE,
    );

    if (pcm16.length === 0) {
      return;
    }

    chunkCount++;
    if (peak > 0.01) {
      nonSilentChunkCount += 1;
    }

    if (chunkCount === 1 || chunkCount % 50 === 0) {
      // #region debug-point A:audio-chunk
      reportVoiceAudioDebug("A", "Chunk audio capture", {
        chunkCount,
        nonSilentChunkCount,
        peak: Number(peak.toFixed(4)),
        inputSamples: channelData.length,
        outputSamples: pcm16.length,
      });
      // #endregion
    }

    onChunk(new Blob([pcm16.buffer], { type: "audio/pcm;rate=16000" }));
  };

  source.connect(processor);
  processor.connect(silentGain);
  silentGain.connect(audioContext.destination);
  // #region debug-point A:audio-pipeline
  reportVoiceAudioDebug("A", "Pipeline audio connecte");
  // #endregion

  return {
    async stop() {
      // #region debug-point A:audio-stop
      reportVoiceAudioDebug("A", "Arret du flux audio", {
        chunkCount,
        nonSilentChunkCount,
      });
      // #endregion
      processor.disconnect();
      silentGain.disconnect();
      source.disconnect();
      mediaStream.getTracks().forEach((track) => track.stop());
      await audioContext.close();
    },
  };
}

export class PcmAudioPlayer {
  private audioContext: AudioContext | null = null;

  private nextStartTime = 0;

  private activeSources = new Set<AudioBufferSourceNode>();

  private async getContext() {
    const AudioContextCtor = getAudioContextCtor();
    if (!AudioContextCtor) {
      throw new Error("AudioContext n'est pas disponible sur cet appareil.");
    }

    if (!this.audioContext || this.audioContext.state === "closed") {
      this.audioContext = new AudioContextCtor();
      this.nextStartTime = 0;
    }

    if (this.audioContext.state === "suspended") {
      await this.audioContext.resume();
    }

    return this.audioContext;
  }

  async enqueue(base64PcmData: string, mimeType?: string) {
    const context = await this.getContext();
    const sampleRate = parseSampleRate(mimeType);
    const pcmBytes = base64ToUint8Array(base64PcmData);
    const pcm16 = new Int16Array(
      pcmBytes.buffer,
      pcmBytes.byteOffset,
      Math.floor(pcmBytes.byteLength / 2),
    );

    if (pcm16.length === 0) {
      return;
    }

    const audioBuffer = context.createBuffer(1, pcm16.length, sampleRate);
    const channel = audioBuffer.getChannelData(0);

    for (let index = 0; index < pcm16.length; index += 1) {
      channel[index] = pcm16[index] / 0x8000;
    }

    const source = context.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(context.destination);
    source.onended = () => {
      source.disconnect();
      this.activeSources.delete(source);
    };

    const startAt = Math.max(context.currentTime, this.nextStartTime);
    source.start(startAt);
    this.nextStartTime = startAt + audioBuffer.duration;
    this.activeSources.add(source);
  }

  stop() {
    this.activeSources.forEach((source) => {
      try {
        source.stop();
      } catch {
        // Ignore repeated stop calls when the source has already ended.
      }
      source.disconnect();
    });

    this.activeSources.clear();

    if (this.audioContext) {
      this.nextStartTime = this.audioContext.currentTime;
    } else {
      this.nextStartTime = 0;
    }
  }

  async dispose() {
    this.stop();

    if (this.audioContext && this.audioContext.state !== "closed") {
      await this.audioContext.close();
    }

    this.audioContext = null;
    this.nextStartTime = 0;
  }
}
