export type PcmChunkHandler = (pcm: Int16Array) => void;

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const LOG_PREFIX = '[GeminiAssistant][Audio]';

export class AudioManager {
  private static instance: AudioManager | null = null;
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private worklet: AudioWorkletNode | null = null;
  private workletUrl: string | null = null;
  private onChunk: PcmChunkHandler | null = null;
  private muted = false;
  private lastSentAt = 0;
  private lastLevelLogAt = 0;
  private sentChunks = 0;

  static getInstance(): AudioManager {
    AudioManager.instance ??= new AudioManager();
    return AudioManager.instance;
  }

  private constructor() {}

  async initialize(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
      console.info(LOG_PREFIX, 'AudioContext créé', { sampleRate: this.context.sampleRate, state: this.context.state });
    }

    if (this.context.state === 'suspended') {
      console.info(LOG_PREFIX, 'AudioContext suspendu, reprise demandée');
      await this.context.resume();
      console.info(LOG_PREFIX, 'AudioContext repris', { state: this.context.state });
    }
  }

  onMicrophoneChunk(handler: PcmChunkHandler | null): void {
    this.onChunk = handler;
    console.info(LOG_PREFIX, handler ? 'Handler PCM micro enregistré' : 'Handler PCM micro retiré');
  }

  async startMicrophone(): Promise<void> {
    await this.initialize();
    if (!this.context) {
      console.error(LOG_PREFIX, 'AudioContext indisponible après initialisation');
      return;
    }

    if (this.stream) {
      console.info(LOG_PREFIX, 'Micro déjà actif, startMicrophone ignoré');
      return;
    }

    console.info(LOG_PREFIX, 'Demande permission micro', { requestedSampleRate: INPUT_SAMPLE_RATE, channelCount: 1 });
    this.stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, sampleRate: INPUT_SAMPLE_RATE } });
    console.info(LOG_PREFIX, 'Micro autorisé', {
      tracks: this.stream.getAudioTracks().map((track) => ({ label: track.label, enabled: track.enabled, muted: track.muted, readyState: track.readyState, settings: track.getSettings() })),
    });

    await this.ensureWorklet(this.context);
    this.source = this.context.createMediaStreamSource(this.stream);
    this.worklet = new AudioWorkletNode(this.context, 'gemini-pcm-processor');
    this.worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      if (this.muted) return;
      const now = Date.now();
      if (now - this.lastSentAt < 20) return;
      this.lastSentAt = now;
      const pcm = new Int16Array(event.data);
      this.sentChunks += 1;
      this.logInputLevel(pcm, now);
      this.onChunk?.(pcm);
    };
    this.worklet.port.onmessageerror = (event) => console.error(LOG_PREFIX, 'Erreur message AudioWorklet', event);
    this.source.connect(this.worklet);
    this.worklet.connect(this.context.destination);
    console.info(LOG_PREFIX, 'Micro connecté à AudioWorkletNode', { contextState: this.context.state });
  }

  stopMicrophone(): void {
    console.info(LOG_PREFIX, 'Arrêt micro', { sentChunks: this.sentChunks });
    this.worklet?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.worklet = null;
    this.source = null;
    this.stream = null;
    this.sentChunks = 0;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    console.info(LOG_PREFIX, muted ? 'Micro muet' : 'Micro réactivé');
  }

  async playPcm16(pcm: Int16Array, sampleRate = OUTPUT_SAMPLE_RATE): Promise<void> {
    await this.initialize();
    if (!this.context) return;
    console.info(LOG_PREFIX, 'Lecture PCM reçue de Gemini', { samples: pcm.length, sampleRate });
    const buffer = this.context.createBuffer(1, pcm.length, sampleRate);
    const channel = buffer.getChannelData(0);
    for (let i = 0; i < pcm.length; i += 1) channel[i] = Math.max(-1, Math.min(1, pcm[i] / 32768));
    const source = this.context.createBufferSource();
    source.buffer = buffer;
    source.connect(this.context.destination);
    source.start();
    await new Promise<void>((resolve) => { source.onended = () => resolve(); });
    console.info(LOG_PREFIX, 'Lecture PCM terminée');
  }

  async playBase64Pcm(base64: string): Promise<void> {
    console.info(LOG_PREFIX, 'Décodage audio base64', { chars: base64.length });
    await this.playPcm16(base64ToInt16(base64));
  }

  async destroy(): Promise<void> {
    this.stopMicrophone();
    if (this.workletUrl) URL.revokeObjectURL(this.workletUrl);
    this.workletUrl = null;
    if (this.context && this.context.state !== 'closed') await this.context.close();
    this.context = null;
    this.onChunk = null;
    console.info(LOG_PREFIX, 'AudioManager détruit');
  }

  private async ensureWorklet(context: AudioContext): Promise<void> {
    if (this.workletUrl) return;
    const processorSource = `
      class GeminiPcmProcessor extends AudioWorkletProcessor {
        process(inputs) {
          const input = inputs[0];
          const channel = input && input[0];
          if (channel && channel.length) {
            const pcm = new Int16Array(channel.length);
            for (let i = 0; i < channel.length; i += 1) {
              const sample = Math.max(-1, Math.min(1, channel[i]));
              pcm[i] = sample < 0 ? sample * 32768 : sample * 32767;
            }
            this.port.postMessage(pcm.buffer, [pcm.buffer]);
          }
          return true;
        }
      }
      registerProcessor('gemini-pcm-processor', GeminiPcmProcessor);
    `;
    this.workletUrl = URL.createObjectURL(new Blob([processorSource], { type: 'application/javascript' }));
    await context.audioWorklet.addModule(this.workletUrl);
    console.info(LOG_PREFIX, 'AudioWorkletNode chargé');
  }

  private logInputLevel(pcm: Int16Array, now: number): void {
    if (now - this.lastLevelLogAt < 1000) return;
    this.lastLevelLogAt = now;
    let peak = 0;
    let sumSquares = 0;
    for (const sample of pcm) {
      const abs = Math.abs(sample);
      peak = Math.max(peak, abs);
      sumSquares += sample * sample;
    }
    const rms = Math.sqrt(sumSquares / Math.max(1, pcm.length));
    console.info(LOG_PREFIX, 'PCM micro capturé', { chunk: this.sentChunks, samples: pcm.length, peak, rms: Math.round(rms), muted: this.muted, hasHandler: Boolean(this.onChunk) });
  }
}

export function int16ToBase64(data: Int16Array): string {
  const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  let binary = '';
  bytes.forEach((byte) => { binary += String.fromCharCode(byte); });
  return btoa(binary);
}

export function base64ToInt16(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}
