import { useState, KeyboardEvent, useEffect, useRef, useCallback } from "react";
import { CornerDownLeft, ScanLine, Keyboard } from "lucide-react";

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

  const focusInput = () => inputRef.current?.focus();

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
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
          className="h-12 min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-semibold font-mono tabular text-stone-900 outline-none transition disabled:opacity-40 focus:border-indigo-500"
          placeholder="Saisir ou scanner..."
          disabled={!isActive}
        />
        <button
          type="button"
          onClick={() => submitScan(value)}
          disabled={!value.trim() || !isActive}
          className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-indigo-600 text-white font-medium shadow-md shadow-indigo-600/25 transition hover:bg-indigo-700 active:scale-95 disabled:pointer-events-none disabled:opacity-40"
          aria-label="Valider le code-barres"
        >
          <CornerDownLeft className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
