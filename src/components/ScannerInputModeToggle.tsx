import { Camera, Image, ScanLine } from "lucide-react";

export type ScannerInputMode = "hardware" | "camera" | "image";

interface ScannerInputModeToggleProps {
  mode: ScannerInputMode;
  onModeChange: (mode: ScannerInputMode) => void;
  disabled?: boolean;
}

export function ScannerInputModeToggle({
  mode,
  onModeChange,
  disabled = false,
}: ScannerInputModeToggleProps) {
  return (
    <div className="rounded-xl border border-stone-200/60 bg-white p-1 shadow-sm">
      <div className="grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={() => onModeChange("hardware")}
          disabled={disabled}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
            mode === "hardware"
              ? "bg-white text-indigo-600 shadow-sm ring-1 ring-indigo-100"
              : "text-stone-500 hover:bg-white/70 hover:text-stone-800"
          }`}
          aria-pressed={mode === "hardware"}
        >
          <ScanLine className="h-4 w-4" />
          Scanner physique
        </button>
        <button
          type="button"
          onClick={() => onModeChange("camera")}
          disabled={disabled}
          className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
            mode === "camera"
              ? "bg-stone-50 text-indigo-600 shadow-xs ring-1 ring-indigo-100"
              : "text-stone-500 hover:bg-stone-50/80 hover:text-stone-800"
          }`}
          aria-pressed={mode === "camera"}
        >
          <Camera className="h-4 w-4" />
          Caméra
        </button>
        <button
          type="button"
          onClick={() => onModeChange("image")}
          disabled={disabled}
          className={`flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-xs font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
            mode === "image"
              ? "bg-stone-50 text-indigo-600 shadow-xs ring-1 ring-indigo-100"
              : "text-stone-500 hover:bg-stone-50/80 hover:text-stone-800"
          }`}
          aria-pressed={mode === "image"}
        >
          <Image className="h-4 w-4" />
          Image
        </button>
      </div>
    </div>
  );
}
