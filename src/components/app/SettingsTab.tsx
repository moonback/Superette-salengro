import React, { useEffect, useState } from "react";
import { Camera, CameraOff, Bot, Brain, Play, Pause, X, Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";

type SettingsTabProps = {
  cameraEnabled: boolean;
  assistantName: string;
  onCameraEnabledChange: (enabled: boolean) => void;
  onAssistantNameChange: (name: string) => void;
  onRequestVectorize?: () => void;
  isGeneratingEmbeddings?: boolean;
  isEmbeddingPaused?: boolean;
  embeddingProgress?: { current: number; total: number; percentage: number };
  embeddingCurrentProduct?: string | null;
  onStopEmbedding?: () => void;
};

export function SettingsTab({ cameraEnabled, assistantName, onCameraEnabledChange, onAssistantNameChange, onRequestVectorize, isGeneratingEmbeddings, isEmbeddingPaused, embeddingProgress, embeddingCurrentProduct, onStopEmbedding }: SettingsTabProps) {
  const [localName, setLocalName] = useState(assistantName);
  const [nameDraft, setNameDraft] = useState(assistantName);
  const { theme, setTheme, isDark } = useTheme();

  useEffect(() => {
    setLocalName(assistantName);
    setNameDraft(assistantName);
  }, [assistantName]);

  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = nameDraft.trim() || "Assistant";
    setLocalName(trimmed);
    onAssistantNameChange(trimmed);
  };

  const themeOptions = [
    { value: 'light' as const, label: 'Clair', icon: Sun },
    { value: 'dark' as const, label: 'Sombre', icon: Moon },
    { value: 'auto' as const, label: 'Auto', icon: Monitor },
  ];

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-extrabold text-stone-900 dark:text-stone-100">Paramètres</h2>

      {/* Theme selector */}
      <div className="rounded-2xl border border-stone-200/60 dark:border-stone-700/60 bg-white dark:bg-stone-900 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-amber-200 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
            {isDark ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100">Thème de l'application</p>
            <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mt-0.5">
              Choisissez votre thème préféré
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setTheme(option.value)}
                className={`flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300'
                    : 'border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-600 dark:text-stone-400 hover:border-stone-300 dark:hover:border-stone-600'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="text-xs font-bold">{option.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Assistant name */}
      <div className="rounded-2xl border border-stone-200/60 dark:border-stone-700/60 bg-white dark:bg-stone-900 p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-violet-200 dark:border-violet-700 bg-violet-50 dark:bg-violet-950 text-violet-600 dark:text-violet-400">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900 dark:text-stone-100">Nom de l'assistant</p>
            <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mt-0.5">
              Utilisé dans l'appli et le system prompt
            </p>
          </div>
        </div>
        <form onSubmit={handleNameSubmit} className="flex gap-2">
          <input
            type="text"
            value={nameDraft}
            onChange={(e) => setNameDraft(e.target.value)}
            maxLength={30}
            className="flex-1 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 px-3 py-2 text-sm font-semibold text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 dark:focus:border-violet-500"
            placeholder="Nom de l'assistant"
          />
          <button
            type="submit"
            disabled={nameDraft.trim() === localName}
            className="rounded-xl bg-violet-600 dark:bg-violet-700 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-violet-600/20 transition active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none cursor-pointer hover:bg-violet-500 dark:hover:bg-violet-600"
          >
            Sauver
          </button>
        </form>
      </div>

      {/* Camera toggle */}
      <div className="rounded-2xl border border-stone-200/60 dark:border-stone-700/60 bg-white dark:bg-stone-900 p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-xl border ${
              cameraEnabled
                ? "border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400"
                : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-400 dark:text-stone-500"
            }`}>
              {cameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900 dark:text-stone-100">Scan caméra</p>
              <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mt-0.5">
                {cameraEnabled ? "Activé — accessible depuis l'onglet Scanner" : "Désactivé — seul le scanner physique est disponible"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCameraEnabledChange(!cameraEnabled)}
            className={`relative h-8 w-14 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer ${
              cameraEnabled ? "bg-indigo-600 dark:bg-indigo-700" : "bg-stone-200 dark:bg-stone-700"
            }`}
            role="switch"
            aria-checked={cameraEnabled}
            aria-label="Activer ou désactiver le scan caméra"
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white dark:bg-stone-200 shadow-sm transition-transform duration-200 ${
                cameraEnabled ? "left-8" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Vectorize action */}
      {onRequestVectorize && (
        <div className={`rounded-2xl border p-4 shadow-sm ${isGeneratingEmbeddings ? "border-indigo-200 dark:border-indigo-700 bg-indigo-50/60 dark:bg-indigo-950/40" : "border-stone-200/60 dark:border-stone-700/60 bg-white dark:bg-stone-900"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl border ${isGeneratingEmbeddings ? "border-indigo-200 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400" : "border-stone-200 dark:border-stone-700 bg-stone-50 dark:bg-stone-800 text-stone-500 dark:text-stone-400"}`}>
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900 dark:text-stone-100">Vectorisation</p>
                <p className="text-[11px] font-medium text-stone-400 dark:text-stone-500 mt-0.5">
                  {isGeneratingEmbeddings
                    ? isEmbeddingPaused
                      ? "En pause"
                      : "Génération des embeddings en cours"
                    : "Générer les embeddings pour la recherche intelligente"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {isGeneratingEmbeddings ? (
                <button
                  type="button"
                  onClick={onStopEmbedding}
                  className="rounded-xl bg-rose-600 dark:bg-rose-700 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-rose-600/20 transition active:scale-[0.97] cursor-pointer hover:bg-rose-500 dark:hover:bg-rose-600"
                >
                  <span className="flex items-center gap-1.5">
                    <X className="h-3.5 w-3.5" />
                    Stop
                  </span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onRequestVectorize}
                  className="rounded-xl bg-indigo-600 dark:bg-indigo-700 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition active:scale-[0.97] cursor-pointer hover:bg-indigo-500 dark:hover:bg-indigo-600"
                >
                  Lancer
                </button>
              )}
            </div>
          </div>

          {isGeneratingEmbeddings && embeddingProgress && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-700 dark:text-indigo-400">
                <span>
                  {isEmbeddingPaused ? "En pause" : "En cours"}
                  {!isEmbeddingPaused && ` · ${embeddingProgress.percentage}%`}
                </span>
                <span className="font-mono">
                  {embeddingProgress.current}/{embeddingProgress.total}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-indigo-200/80 dark:bg-indigo-900/60 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 dark:from-indigo-400 dark:to-violet-400"
                  style={{ width: `${Math.min(100, Math.max(0, embeddingProgress.percentage))}%` }}
                />
              </div>
              {embeddingCurrentProduct && (
                <p className="text-[10px] text-indigo-600 dark:text-indigo-400 truncate">
                  En cours : {embeddingCurrentProduct}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
