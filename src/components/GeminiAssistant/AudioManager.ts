export type PcmChunkHandler = (pcm: Int16Array) => void;

const INPUT_SAMPLE_RATE = 16000;
const OUTPUT_SAMPLE_RATE = 24000;
const INT16_MAX = 32767;
const INT16_MIN = 32768;

export class AudioManager {
  private static instance: AudioManager | null = null;
  private context: AudioContext | null = null;
  private stream: MediaStream | null = null;
  private source: MediaStreamAudioSourceNode | null = null;
  private worklet: AudioWorkletNode | null = null;
  private silentSink: GainNode | null = null;
  private workletUrl: string | null = null;
  private onChunk: PcmChunkHandler | null = null;
  private muted = false;
  private sentChunks = 0;
  private accumulationBuffer: Int16Array | null = null;
  private accumulationIndex = 0;
  private readonly ACCUMULATION_SIZE = 1024; // ~64ms of audio at 16kHz
  private playbackQueue: { pcm: Int16Array; resolve: () => void }[] = [];
  private isPlaying = false;
  private activeSource: AudioBufferSourceNode | null = null;

  static getInstance(): AudioManager {
    AudioManager.instance ??= new AudioManager();
    return AudioManager.instance;
  }

  private constructor() { }

  async initialize(): Promise<void> {
    if (!this.context) {
      this.context = new AudioContext({ sampleRate: INPUT_SAMPLE_RATE });
    }

    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
  }

  onMicrophoneChunk(handler: PcmChunkHandler | null): void {
    this.onChunk = handler;
  }

  get chunksSent(): number {
    return this.sentChunks;
  }

  async startMicrophone(): Promise<void> {
    await this.initialize();
    if (!this.context) {
      return;
    }

    if (this.stream) {
      return;
    }

    try {
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: { channelCount: 1, echoCancellation: true, noiseSuppression: true, sampleRate: INPUT_SAMPLE_RATE },
      });
    } catch (err) {
      this.stream = null;
      throw new Error(`Unable to access microphone: ${err instanceof Error ? err.message : String(err)}`);
    }

    await this.ensureWorklet(this.context);
    this.source = this.context.createMediaStreamSource(this.stream);
    this.worklet = new AudioWorkletNode(this.context, 'gemini-pcm-processor');
    this.worklet.port.onmessage = (event: MessageEvent<ArrayBuffer>) => {
      if (this.muted) return;

      const newPcm = new Int16Array(event.data);

      if (!this.accumulationBuffer) {
        this.accumulationBuffer = new Int16Array(this.ACCUMULATION_SIZE);
        this.accumulationIndex = 0;
      }

      for (let i = 0; i < newPcm.length; i++) {
        this.accumulationBuffer[this.accumulationIndex++] = newPcm[i];

        if (this.accumulationIndex >= this.ACCUMULATION_SIZE) {
          const chunkToSend = new Int16Array(this.accumulationBuffer);
          this.sentChunks += 1;
          this.onChunk?.(chunkToSend);
          this.accumulationIndex = 0;
        }
      }
    };

    this.source.connect(this.worklet);

    // IMPORTANT: ne pas connecter le worklet à context.destination,
    // sinon l'utilisateur entend sa propre voix en écho. Certains
    // navigateurs (anciens Safari) exigent toutefois un nœud de sortie
    // connecté pour que le graphe audio reste actif, donc on route vers
    // un gain à volume nul plutôt que vers la sortie réelle.
    this.silentSink = this.context.createGain();
    this.silentSink.gain.value = 0;
    this.worklet.connect(this.silentSink);
    this.silentSink.connect(this.context.destination);
  }

  stopMicrophone(): void {
    this.flushAccumulationBuffer();

    this.worklet?.disconnect();
    this.silentSink?.disconnect();
    this.source?.disconnect();
    this.stream?.getTracks().forEach((track) => track.stop());
    this.worklet = null;
    this.silentSink = null;
    this.source = null;
    this.stream = null;
    this.sentChunks = 0;
    this.accumulationBuffer = null;
    this.accumulationIndex = 0;
  }

  /** Envoie les échantillons accumulés restants avant qu'ils ne soient perdus. */
  private flushAccumulationBuffer(): void {
    if (!this.accumulationBuffer || this.accumulationIndex === 0 || this.muted) return;

    const remaining = this.accumulationBuffer.slice(0, this.accumulationIndex);
    this.sentChunks += 1;
    this.onChunk?.(remaining);
    this.accumulationIndex = 0;
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
  }

  async playPcm16(pcm: Int16Array, sampleRate = OUTPUT_SAMPLE_RATE): Promise<void> {
    await this.initialize();
    if (!this.context) return;
    return new Promise<void>((resolve) => {
      this.playbackQueue.push({ pcm, resolve });
      if (!this.isPlaying) {
        void this.processPlaybackQueue(sampleRate);
      }
    });
  }

  private async processPlaybackQueue(sampleRate: number): Promise<void> {
    if (this.isPlaying || !this.context) return;
    this.isPlaying = true;

    try {
      while (this.playbackQueue.length > 0) {
        const item = this.playbackQueue.shift();
        if (!item) continue;

        const { pcm, resolve } = item;
        const buffer = this.context.createBuffer(1, pcm.length, sampleRate);
        const channel = buffer.getChannelData(0);
        for (let i = 0; i < pcm.length; i += 1) channel[i] = Math.max(-1, Math.min(1, pcm[i] / INT16_MIN));

        const source = this.context.createBufferSource();
        this.activeSource = source;
        source.buffer = buffer;
        source.connect(this.context.destination);
        source.start();

        await new Promise<void>((done) => {
          source.onended = () => {
            if (this.activeSource === source) {
              this.activeSource = null;
            }
            done();
          };
        });

        resolve();
      }
    } finally {
      this.isPlaying = false;
    }
  }

  stopPlayback(): void {
    const currentQueue = [...this.playbackQueue];
    this.playbackQueue = [];
    currentQueue.forEach((item) => item.resolve());

    if (this.activeSource) {
      try {
        this.activeSource.stop();
      } catch {
        // stop() lève si la source est déjà arrêtée/terminée naturellement ; sans danger ici.
      }
      this.activeSource = null;
    }
  }

  async playBase64Pcm(base64: string): Promise<void> {
    await this.playPcm16(base64ToInt16(base64));
  }

  async destroy(): Promise<void> {
    this.stopMicrophone();
    this.stopPlayback();
    if (this.workletUrl) URL.revokeObjectURL(this.workletUrl);
    this.workletUrl = null;
    if (this.context && this.context.state !== 'closed') await this.context.close();
    this.context = null;
    this.onChunk = null;
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
  }
}

export function int16ToBase64(data: Int16Array): string {
  const bytes = new Uint8Array(data.buffer, data.byteOffset, data.byteLength);
  const CHUNK_SIZE = 0x8000; // évite de dépasser la limite d'arguments de String.fromCharCode
  let binary = '';
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    binary += String.fromCharCode(...bytes.subarray(i, i + CHUNK_SIZE));
  }
  return btoa(binary);
}

export function base64ToInt16(base64: string): Int16Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  return new Int16Array(bytes.buffer);
}