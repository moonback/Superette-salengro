import React, { useEffect, useState } from "react";
import { Camera, CameraOff, Bot, Brain, Play, Pause, X } from "lucide-react";

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

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-extrabold text-stone-900">Paramètres</h2>

      {/* Assistant name */}
      <div className="rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm space-y-3">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl border border-violet-200 bg-violet-50 text-violet-600">
            <Bot className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-stone-900">Nom de l'assistant</p>
            <p className="text-[11px] font-medium text-stone-400 mt-0.5">
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
            className="flex-1 rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-sm font-semibold text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400"
            placeholder="Nom de l'assistant"
          />
          <button
            type="submit"
            disabled={nameDraft.trim() === localName}
            className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-violet-600/20 transition active:scale-[0.97] disabled:opacity-40 disabled:pointer-events-none cursor-pointer hover:bg-violet-500"
          >
            Sauver
          </button>
        </form>
      </div>

      {/* Camera toggle */}
      <div className="rounded-2xl border border-stone-200/60 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={`grid h-10 w-10 place-items-center rounded-xl border ${
              cameraEnabled
                ? "border-indigo-200 bg-indigo-50 text-indigo-600"
                : "border-stone-200 bg-stone-50 text-stone-400"
            }`}>
              {cameraEnabled ? <Camera className="h-5 w-5" /> : <CameraOff className="h-5 w-5" />}
            </div>
            <div>
              <p className="text-sm font-bold text-stone-900">Scan caméra</p>
              <p className="text-[11px] font-medium text-stone-400 mt-0.5">
                {cameraEnabled ? "Activé — accessible depuis l'onglet Scanner" : "Désactivé — seul le scanner physique est disponible"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onCameraEnabledChange(!cameraEnabled)}
            className={`relative h-8 w-14 rounded-full transition-colors duration-200 flex-shrink-0 cursor-pointer ${
              cameraEnabled ? "bg-indigo-600" : "bg-stone-200"
            }`}
            role="switch"
            aria-checked={cameraEnabled}
            aria-label="Activer ou désactiver le scan caméra"
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                cameraEnabled ? "left-8" : "left-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Vectorize action */}
      {onRequestVectorize && (
        <div className={`rounded-2xl border p-4 shadow-sm ${isGeneratingEmbeddings ? "border-indigo-200 bg-indigo-50/60" : "border-stone-200/60 bg-white"}`}>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className={`grid h-10 w-10 place-items-center rounded-xl border ${isGeneratingEmbeddings ? "border-indigo-200 bg-indigo-50 text-indigo-600" : "border-stone-200 bg-stone-50 text-stone-500"}`}>
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-bold text-stone-900">Vectorisation</p>
                <p className="text-[11px] font-medium text-stone-400 mt-0.5">
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
                  className="rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white shadow-sm shadow-rose-600/20 transition active:scale-[0.97] cursor-pointer hover:bg-rose-500"
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
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/20 transition active:scale-[0.97] cursor-pointer hover:bg-indigo-500"
                >
                  Lancer
                </button>
              )}
            </div>
          </div>

          {isGeneratingEmbeddings && embeddingProgress && (
            <div className="mt-3 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-indigo-700">
                <span>
                  {isEmbeddingPaused ? "En pause" : "En cours"}
                  {!isEmbeddingPaused && ` · ${embeddingProgress.percentage}%`}
                </span>
                <span className="font-mono">
                  {embeddingProgress.current}/{embeddingProgress.total}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-indigo-200/80 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500"
                  style={{ width: `${Math.min(100, Math.max(0, embeddingProgress.percentage))}%` }}
                />
              </div>
              {embeddingCurrentProduct && (
                <p className="text-[10px] text-indigo-600 truncate">
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
