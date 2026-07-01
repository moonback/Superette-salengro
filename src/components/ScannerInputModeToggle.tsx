import { Camera, ScanLine } from "lucide-react";
import { motion } from "motion/react";

export type ScannerInputMode = "hardware" | "camera";

interface ScannerInputModeToggleProps {
  mode: ScannerInputMode;
  onModeChange: (mode: ScannerInputMode) => void;
  disabled?: boolean;
  cameraEnabled?: boolean;
}

export function ScannerInputModeToggle({
  mode,
  onModeChange,
  disabled = false,
  cameraEnabled = true,
}: ScannerInputModeToggleProps) {
  return (
    <div className="rounded-2xl border border-stone-200/60 bg-white p-1 shadow-sm">
      <div className={`grid gap-1 relative z-0 ${cameraEnabled ? 'grid-cols-2' : 'grid-cols-1'}`}>
        <button
          type="button"
          onClick={() => onModeChange('hardware')}
          disabled={disabled}
          className={`relative flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition duration-200 select-none cursor-pointer disabled:pointer-events-none disabled:opacity-40 ${
            mode === 'hardware' ? 'text-indigo-600 font-extrabold' : 'text-stone-500 hover:text-stone-800'
          }`}
          aria-pressed={mode === 'hardware'}
        >
          {mode === 'hardware' && (
            <motion.div
              layoutId="activeScanChoicePill"
              className="absolute inset-0 bg-stone-50 rounded-xl border border-stone-200/30 -z-10 shadow-xs"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <ScanLine className="h-4 w-4" />
          {cameraEnabled && 'Scanner physique'}
        </button>
        {cameraEnabled && (
          <button
            type="button"
            onClick={() => onModeChange('camera')}
            disabled={disabled}
            className={`relative flex min-h-11 items-center justify-center gap-2 rounded-xl px-3 text-xs font-bold transition duration-200 select-none cursor-pointer disabled:pointer-events-none disabled:opacity-40 ${
              mode === 'camera' ? 'text-indigo-600 font-extrabold' : 'text-stone-500 hover:text-stone-800'
            }`}
            aria-pressed={mode === 'camera'}
          >
            {mode === 'camera' && (
              <motion.div
                layoutId="activeScanChoicePill"
                className="absolute inset-0 bg-stone-50 rounded-xl border border-stone-200/30 -z-10 shadow-xs"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <Camera className="h-4 w-4" />
            Caméra
          </button>
        )}
      </div>
    </div>
  );
}
