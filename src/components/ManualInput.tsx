import { useState, KeyboardEvent, useEffect, useRef, useCallback } from "react";
import { CornerDownLeft, Keyboard, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

const SCANNER_AUTO_SUBMIT_DELAY_MS = 120;
const MIN_BARCODE_LENGTH = 8;

export function ManualInput({
  onScan,
  isActive,
}: {
  onScan: (code: string) => void;
  isActive: boolean;
}) {
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoSubmitTimeoutRef = useRef<number | null>(null);

  const clearAutoSubmitTimeout = useCallback(() => {
    if (autoSubmitTimeoutRef.current) {
      window.clearTimeout(autoSubmitTimeoutRef.current);
      autoSubmitTimeoutRef.current = null;
    }
  }, []);

  const submitScan = useCallback(
    (code: string) => {
      const trimmedCode = code.trim();
      if (!trimmedCode) return;

      clearAutoSubmitTimeout();
      onScan(trimmedCode);
      setValue("");
      inputRef.current?.focus();
    },
    [clearAutoSubmitTimeout, onScan],
  );

  useEffect(() => {
    if (isActive && inputRef.current) inputRef.current.focus();
  }, [isActive]);

  useEffect(() => {
    clearAutoSubmitTimeout();
    const trimmedValue = value.trim();
    const looksLikeBarcode =
      /^\d+$/.test(trimmedValue) && trimmedValue.length >= MIN_BARCODE_LENGTH;
    if (!isActive || !looksLikeBarcode) return;

    autoSubmitTimeoutRef.current = window.setTimeout(
      () => submitScan(trimmedValue),
      SCANNER_AUTO_SUBMIT_DELAY_MS,
    );
    return clearAutoSubmitTimeout;
  }, [clearAutoSubmitTimeout, isActive, submitScan, value]);

  useEffect(() => clearAutoSubmitTimeout, [clearAutoSubmitTimeout]);

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if ((e.key === "Enter" || e.key === "Tab") && value.trim() !== "") {
      e.preventDefault();
      submitScan(value);
    }
  };

  return (
    <div className="space-y-2">
      <motion.div 
        animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        className="flex gap-2 relative"
      >
        <div className="relative flex-1 group">
          <Keyboard className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors duration-200 pointer-events-none ${
            isFocused ? "text-indigo-600" : "text-stone-400"
          }`} />
          <input
            id="barcode-input"
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={`w-full h-12 pl-10 ${value ? 'pr-10' : 'pr-4'} rounded-2xl border border-stone-200 bg-white text-sm font-semibold font-mono tabular text-stone-900 outline-none transition-all disabled:opacity-40 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 shadow-sm hover:border-stone-300`}
            placeholder="Saisir ou scanner..."
            disabled={!isActive}
          />
          <AnimatePresence>
            {value && (
              <motion.button
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                type="button"
                onClick={() => {
                  setValue("");
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700 grid place-items-center transition-colors cursor-pointer"
                aria-label="Effacer la saisie"
              >
                <X className="h-3.5 w-3.5 stroke-[2.5]" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => submitScan(value)}
          disabled={!value.trim() || !isActive}
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white font-bold shadow-md shadow-indigo-600/20 transition-all duration-200 hover:bg-indigo-700 active:scale-95 disabled:pointer-events-none disabled:opacity-40 cursor-pointer"
          aria-label="Valider le code-barres"
        >
          <CornerDownLeft className="h-5 w-5 stroke-[2.5]" />
        </motion.button>
      </motion.div>
    </div>
  );
}
