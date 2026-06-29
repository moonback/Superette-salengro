import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, CameraOff, Loader2, X, Sparkles, Image as ImageIcon } from "lucide-react";
import { motion, PanInfo } from "motion/react";
import { recognizeProductFromImage, type RecognizedProduct } from "../lib/geminiVision";

interface ImageProductRecognitionProps {
  onRecognize: (result: RecognizedProduct) => void;
}

export function ImageProductRecognition({ onRecognize }: ImageProductRecognitionProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const startLockRef = useRef(false);

  const [isOpen, setIsOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    startLockRef.current = false;
    setIsOpen(false);
    setIsStarting(false);
    setStatus(null);
    setError(null);
    setIsAnalyzing(false);
  }, []);

  const startCamera = useCallback(async () => {
    if (startLockRef.current) return;
    startLockRef.current = true;
    setIsStarting(true);
    setError(null);
    setStatus("Demande d'autorisation camera...");

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error("La camera n'est pas disponible sur ce navigateur.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: { ideal: "environment" },
        },
        audio: false,
      });
      streamRef.current = stream;

      const video = videoRef.current;
      if (!video) {
        throw new Error("Element video indisponible.");
      }
      video.srcObject = stream;
      await video.play();

      setIsOpen(true);
      setStatus("Camera prete. Cadrez le produit et appuyez sur Analyser.");
    } catch (err) {
      console.error("Erreur camera:", err);
      stopCamera();
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'activer la camera. Verifiez les permissions.",
      );
    } finally {
      startLockRef.current = false;
      setIsStarting(false);
    }
  }, [stopCamera]);

  const captureAndAnalyze = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Contexte canvas indisponible.");

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob: Blob = await new Promise((resolve) =>
        canvas.toBlob((b) => resolve(b ?? new Blob()), "image/jpeg", 0.85),
      );

      const file = new File([blob], `scan-${Date.now()}.jpg`, {
        type: blob.type || "image/jpeg",
      });

      const preview = URL.createObjectURL(blob);
      setPreviewUrl(preview);

      setStatus("Analyse de l'image par Gemini...");
      const result = await recognizeProductFromImage(file);
      onRecognize(result);
      stopCamera();
    } catch (err) {
      console.error("Erreur reconnaissance image:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Impossible d'analyser l'image.",
      );
      setStatus(null);
    } finally {
      setIsAnalyzing(false);
    }
  }, [onRecognize, stopCamera]);

  useEffect(() => {
    return () => {
      stopCamera();
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragEnd = useCallback(
    (_: any, info: PanInfo) => {
      if (info.offset.y > 120 && !isAnalyzing) {
        stopCamera();
      }
    },
    [isAnalyzing, stopCamera],
  );

  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white shadow-sm overflow-hidden">
      <div className="relative bg-stone-950" style={{ aspectRatio: "4/3" }}>
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          muted
          playsInline
        />

        {!isOpen && !isStarting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-stone-900">
            <div className="relative h-36 w-52">
              <span className="absolute top-0 left-0 h-7 w-7 border-t-2 border-l-2 border-indigo-400 rounded-tl-md" />
              <span className="absolute top-0 right-0 h-7 w-7 border-t-2 border-r-2 border-indigo-400 rounded-tr-md" />
              <span className="absolute bottom-0 left-0 h-7 w-7 border-b-2 border-l-2 border-indigo-400 rounded-bl-md" />
              <span className="absolute bottom-0 right-0 h-7 w-7 border-b-2 border-r-2 border-indigo-400 rounded-br-md" />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-white">
                <ImageIcon className="h-7 w-7 text-stone-500" />
                <p className="text-[11px] font-bold text-stone-300 text-center px-4">
                  Reconnaissance produit par photo
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => void startCamera()}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition active:scale-[0.98] disabled:opacity-40 select-none cursor-pointer hover:bg-indigo-500"
            >
              <Camera className="h-4 w-4" />
              Ouvrir la camera
            </button>
          </div>
        )}

        {isStarting && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-stone-900/90 text-white backdrop-blur-sm">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
            <p className="text-xs font-bold text-stone-300">Activation camera...</p>
          </div>
        )}

        {isOpen && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-stone-950/30" />
            <div className="relative z-10 h-36 w-64">
              <span className="absolute top-0 left-0 h-6 w-6 border-t-[3px] border-l-[3px] border-white rounded-tl-md" />
              <span className="absolute top-0 right-0 h-6 w-6 border-t-[3px] border-r-[3px] border-white rounded-tr-md" />
              <span className="absolute bottom-0 left-0 h-6 w-6 border-b-[3px] border-l-[3px] border-white rounded-bl-md" />
              <span className="absolute bottom-0 right-0 h-6 w-6 border-b-[3px] border-r-[3px] border-white rounded-br-md" />
            </div>
          </div>
        )}

        {previewUrl && (
          <div className="absolute inset-0 z-20 bg-stone-950/90 flex items-center justify-center">
            <img
              src={previewUrl}
              alt="Apercu capture"
              className="max-h-full max-w-full object-contain"
            />
          </div>
        )}

        <div className="absolute top-2.5 left-2.5">
          <span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[9px] font-bold backdrop-blur-sm ${
            isOpen
              ? 'bg-emerald-900/70 text-emerald-300'
              : 'bg-stone-900/60 text-stone-400'
          }`}>
            <span className={`h-1.5 w-1.5 rounded-full ${
              isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-stone-500'
            }`} />
            {isAnalyzing ? 'Analyse en cours' : isOpen ? 'Camera prete' : 'Pret'}
          </span>
        </div>
      </div>

      <canvas ref={canvasRef} className="hidden" />

      <div className="flex items-center justify-between gap-3 border-b border-stone-100 px-4 py-2.5">
        <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
          <Sparkles className="h-3 w-3" />
          Reconnaissance image
        </span>
        {isOpen && (
          <button
            type="button"
            onClick={stopCamera}
            className="grid h-8 w-8 place-items-center rounded-xl border border-stone-200/80 bg-white text-stone-500 transition hover:text-stone-900 active:scale-95 cursor-pointer"
            aria-label="Fermer la camera"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <motion.div
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={0.2}
          onDragEnd={handleDragEnd}
          className="px-4 py-3"
        >
          <button
            type="button"
            onClick={captureAndAnalyze}
            disabled={isAnalyzing}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 text-xs font-bold text-white shadow-md shadow-indigo-600/10 transition active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none select-none cursor-pointer hover:bg-indigo-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyse en cours...
              </>
            ) : (
              <>
                <ImageIcon className="h-4 w-4" />
                Analyser la photo
              </>
            )}
          </button>
        </motion.div>
      )}

      {status && !error && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 px-3 py-2.5 text-[11px] font-semibold text-indigo-700">
          <span>{status}</span>
        </div>
      )}

      {error && (
        <div className="mx-4 mb-3 flex items-start gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2.5 text-[11px] font-semibold text-rose-600">
          <CameraOff className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
