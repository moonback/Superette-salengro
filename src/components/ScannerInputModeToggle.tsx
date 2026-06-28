import { Camera, ScanLine } from "lucide-react";

export type ScannerInputMode = "hardware" | "camera";

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
    <div className="rounded-2xl border border-slate-200 bg-white p-1">
      <div className="grid grid-cols-2 gap-1">
        <button
          type="button"
          onClick={() => onModeChange("hardware")}
          disabled={disabled}
          className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
            mode === "hardware"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
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
          className={`flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 ${
            mode === "camera"
                  ? "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-white hover:text-slate-900"
          }`}
          aria-pressed={mode === "camera"}
        >
          <Camera className="h-4 w-4" />
          Caméra
        </button>
      </div>
    </div>
  );
}
