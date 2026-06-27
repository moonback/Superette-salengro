import { ActivityHandling, GoogleGenAI, Modality } from "@google/genai";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  AudioLines,
  Bot,
  Loader2,
  Mic,
  MicOff,
  Minimize2,
  Send,
  ShieldAlert,
  Sparkles,
  Volume2,
  X,
} from "lucide-react";
import type { CategoryItem, InventoryItem } from "../../types";
import type { AppTab } from "../app/AppNavigation";
import { PcmAudioPlayer, type MicrophonePcmStream, startMicrophonePcmStream } from "./audio";
import {
  buildGeminiAssistantSystemPrompt,
  type GeminiAssistantPromptContext,
} from "./systemPrompt";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const GEMINI_LIVE_MODEL = import.meta.env.VITE_GEMINI_LIVE_MODEL as string | undefined
  ?? "gemini-live-2.5-flash-preview";
const STORE_NAME = "Superette Salengro";
const DEBUG_SERVER_URL = "http://127.0.0.1:7777/event";
const DEBUG_SESSION_ID = "voice-no-response";

type StockFilter = "all" | "low" | "out" | "instock";
type SortBy = "recent" | "name" | "quantityAsc" | "quantityDesc";
type AssistantStatus = "idle" | "connecting" | "listening" | "speaking" | "error";

type HistorySpeaker = "user" | "assistant" | "system";

type HistoryItem = {
  id: string;
  speaker: HistorySpeaker;
  text: string;
};

type AssistantToolPlan = {
  callId: string;
  toolName: string;
  summary: string;
  execute: () => Promise<Record<string, unknown>>;
};

type GeminiAssistantProps = {
  open: boolean;
  minimized: boolean;
  inventory: InventoryItem[];
  categories: CategoryItem[];
  activeTab: AppTab;
  searchTerm: string;
  selectedCategory: string | null;
  stockFilter: StockFilter;
  sortBy: SortBy;
  isOnline: boolean;
  pendingCount: number;
  onOpenChange: (open: boolean) => void;
  onMinimizedChange: (minimized: boolean) => void;
  onSetActiveTab: (tab: AppTab) => void;
  onSetSearchTerm: (term: string) => void;
  onSetSelectedCategory: (category: string | null) => void;
  onSetStockFilter: (filter: StockFilter) => void;
  onSetSortBy: (sortBy: SortBy) => void;
  onAdjustStock: (barcode: string, delta: number) => Promise<void>;
  onSetQuantity: (barcode: string, quantity: number) => Promise<void>;
  onRemoveItem: (barcode: string) => Promise<void>;
  onExport: () => void;
  showToast: (message: string) => void;
};

type AssistantContextRef = {
  inventory: InventoryItem[];
  categories: CategoryItem[];
  activeTab: AppTab;
  searchTerm: string;
  selectedCategory: string | null;
  stockFilter: StockFilter;
  sortBy: SortBy;
  isOnline: boolean;
  pendingCount: number;
};

const assistantTools = [
  {
    functionDeclarations: [
      {
        name: "get_inventory_overview",
        description: "Retourne un resume fiable du stock, des alertes et des articles prioritaires.",
        parametersJsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            limit: { type: "number", minimum: 1, maximum: 10 },
            onlyLowStock: { type: "boolean" },
          },
        },
      },
      {
        name: "find_inventory_item",
        description: "Recherche un article par nom, marque, categorie ou code-barres.",
        parametersJsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            query: { type: "string" },
            barcode: { type: "string" },
          },
        },
      },
      {
        name: "navigate_inventory",
        description: "Ouvre un onglet ou applique un filtre non sensible dans l'application.",
        parametersJsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            tab: { type: "string", enum: ["scan", "autoScan", "stock", "categories"] },
            searchTerm: { type: "string" },
            category: { type: "string" },
            stockFilter: { type: "string", enum: ["all", "low", "out", "instock"] },
            sortBy: {
              type: "string",
              enum: ["recent", "name", "quantityAsc", "quantityDesc"],
            },
          },
        },
      },
      {
        name: "adjust_stock",
        description: "Ajoute ou retire une quantite a un article. Action sensible, soumise a confirmation utilisateur.",
        parametersJsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            barcode: { type: "string" },
            query: { type: "string" },
            delta: { type: "number" },
          },
          required: ["delta"],
        },
      },
      {
        name: "set_stock_quantity",
        description: "Definit la quantite exacte d'un article. Action sensible, soumise a confirmation utilisateur.",
        parametersJsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            barcode: { type: "string" },
            query: { type: "string" },
            quantity: { type: "number", minimum: 0 },
          },
          required: ["quantity"],
        },
      },
      {
        name: "delete_inventory_item",
        description: "Supprime un article de l'inventaire. Action sensible, soumise a confirmation utilisateur.",
        parametersJsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {
            barcode: { type: "string" },
            query: { type: "string" },
          },
        },
      },
      {
        name: "export_inventory_snapshot",
        description: "Declenche l'export CSV de l'inventaire courant.",
        parametersJsonSchema: {
          type: "object",
          additionalProperties: false,
          properties: {},
        },
      },
    ],
  },
];

function normalize(value?: string | null) {
  return (value ?? "").trim().toLocaleLowerCase("fr-FR");
}

function createHistoryItem(speaker: HistorySpeaker, text: string): HistoryItem {
  return {
    id: `${speaker}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    speaker,
    text,
  };
}

function formatTabLabel(tab: AppTab) {
  switch (tab) {
    case "scan":
      return "scanner";
    case "autoScan":
      return "auto scan";
    case "stock":
      return "stock";
    case "categories":
      return "categories";
    default:
      return tab;
  }
}

function historyBubbleClasses(speaker: HistorySpeaker) {
  if (speaker === "assistant") {
    return "self-start border-indigo-200 bg-indigo-50 text-indigo-950";
  }

  if (speaker === "user") {
    return "self-end border-emerald-200 bg-emerald-50 text-emerald-950";
  }

  return "self-center border-stone-200 bg-stone-100 text-stone-700";
}

// #region debug-point C:session-report
function reportVoiceSessionDebug(hypothesisId: string, msg: string, data?: Record<string, unknown>) {
  if (!(window as typeof window & { __VOICE_DEBUG__?: boolean }).__VOICE_DEBUG__) {
    return;
  }
  fetch(DEBUG_SERVER_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      sessionId: DEBUG_SESSION_ID,
      runId: "pre-fix",
      hypothesisId,
      location: "src/components/GeminiAssistant/GeminiAssistant.tsx",
      msg: `[DEBUG] ${msg}`,
      data,
      ts: Date.now(),
    }),
  }).catch(() => undefined);
}
// #endregion

export function GeminiAssistant({
  open,
  minimized,
  inventory,
  categories,
  activeTab,
  searchTerm,
  selectedCategory,
  stockFilter,
  sortBy,
  isOnline,
  pendingCount,
  onOpenChange,
  onMinimizedChange,
  onSetActiveTab,
  onSetSearchTerm,
  onSetSelectedCategory,
  onSetStockFilter,
  onSetSortBy,
  onAdjustStock,
  onSetQuantity,
  onRemoveItem,
  onExport,
  showToast,
}: GeminiAssistantProps) {
  const [status, setStatus] = useState<AssistantStatus>("idle");
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([
    createHistoryItem(
      "assistant",
      "Julien est pret. Ouvre la session vocale pour parler du stock.",
    ),
  ]);
  const [draftUserTranscript, setDraftUserTranscript] = useState("");
  const [draftAssistantTranscript, setDraftAssistantTranscript] = useState("");
  const [typedMessage, setTypedMessage] = useState("");
  const [pendingApprovals, setPendingApprovals] = useState<AssistantToolPlan[]>([]);

  const sessionRef = useRef<{
    close: () => void;
    sendClientContent: (params: {
      turns?: Array<{ role: "user"; parts: Array<{ text: string }> }> | { role: "user"; parts: Array<{ text: string }> };
      turnComplete?: boolean;
    }) => void;
    sendRealtimeInput: (params: {
      audio?: Blob;
      audioStreamEnd?: boolean;
    }) => void;
    sendToolResponse: (params: {
      functionResponses:
        | {
            id?: string;
            name?: string;
            response?: Record<string, unknown>;
          }
        | Array<{
            id?: string;
            name?: string;
            response?: Record<string, unknown>;
          }>;
    }) => void;
  } | null>(null);
  const micStreamRef = useRef<MicrophonePcmStream | null>(null);
  const playerRef = useRef<PcmAudioPlayer | null>(null);
  const historyEndRef = useRef<HTMLDivElement | null>(null);
  const contextRef = useRef<AssistantContextRef>({
    inventory,
    categories,
    activeTab,
    searchTerm,
    selectedCategory,
    stockFilter,
    sortBy,
    isOnline,
    pendingCount,
  });
  const draftUserRef = useRef("");
  const draftAssistantRef = useRef("");
  const manualCloseRef = useRef(false);
  const sentAudioChunkCountRef = useRef(0);

  const promptContext = useMemo<GeminiAssistantPromptContext>(() => {
    const totalUnits = inventory.reduce((sum, item) => sum + item.quantity, 0);
    const lowStockItems = [...inventory]
      .filter((item) => item.quantity <= 5)
      .sort((left, right) => left.quantity - right.quantity || left.name.localeCompare(right.name))
      .slice(0, 6)
      .map((item) => ({
        barcode: item.barcode,
        name: item.name,
        quantity: item.quantity,
        category: item.category,
        brand: item.brand,
      }));

    return {
      storeName: STORE_NAME,
      activeTab,
      isOnline,
      pendingCount,
      totalReferences: inventory.length,
      totalUnits,
      lowStockCount: inventory.filter((item) => item.quantity <= 5).length,
      categories: categories.map((category) => category.name),
      highlightedItems: lowStockItems,
    };
  }, [activeTab, categories, inventory, isOnline, pendingCount]);

  useEffect(() => {
    contextRef.current = {
      inventory,
      categories,
      activeTab,
      searchTerm,
      selectedCategory,
      stockFilter,
      sortBy,
      isOnline,
      pendingCount,
    };
  }, [
    activeTab,
    categories,
    inventory,
    isOnline,
    pendingCount,
    searchTerm,
    selectedCategory,
    sortBy,
    stockFilter,
  ]);

  const pushHistory = useCallback((speaker: HistorySpeaker, text: string) => {
    const trimmed = text.trim();
    if (!trimmed) {
      return;
    }

    setHistory((current) => [...current, createHistoryItem(speaker, trimmed)]);
  }, []);

  const clearDrafts = useCallback(() => {
    draftUserRef.current = "";
    draftAssistantRef.current = "";
    setDraftUserTranscript("");
    setDraftAssistantTranscript("");
  }, []);

  const commitUserDraft = useCallback(() => {
    const nextValue = draftUserRef.current.trim();
    if (!nextValue) {
      return;
    }

    pushHistory("user", nextValue);
    draftUserRef.current = "";
    setDraftUserTranscript("");
  }, [pushHistory]);

  const commitAssistantDraft = useCallback(() => {
    const nextValue = draftAssistantRef.current.trim();
    if (!nextValue) {
      return;
    }

    pushHistory("assistant", nextValue);
    draftAssistantRef.current = "";
    setDraftAssistantTranscript("");
  }, [pushHistory]);

  const releaseAudioResources = useCallback(async () => {
    const micStream = micStreamRef.current;
    micStreamRef.current = null;
    if (micStream) {
      await micStream.stop().catch(() => undefined);
    }

    const player = playerRef.current;
    playerRef.current = null;
    if (player) {
      await player.dispose().catch(() => undefined);
    }
  }, []);

  const resetSessionState = useCallback(async () => {
    setIsSessionActive(false);
    setSessionId(null);
    setPendingApprovals([]);
    clearDrafts();
    await releaseAudioResources();
    sessionRef.current = null;
  }, [clearDrafts, releaseAudioResources]);

  useEffect(() => {
    historyEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [history, draftAssistantTranscript, draftUserTranscript, pendingApprovals.length, open]);

  useEffect(() => {
    if (!open && !isSessionActive) {
      setTypedMessage("");
    }
  }, [isSessionActive, open]);

  useEffect(() => {
    // #region debug-point E:lifecycle-mount
    reportVoiceSessionDebug("E", "Effet cycle de vie attache");
    // #endregion
    return () => {
      // #region debug-point E:lifecycle-cleanup
      reportVoiceSessionDebug("E", "Cleanup composant GeminiAssistant", {
        hasSession: Boolean(sessionRef.current),
      });
      // #endregion
      manualCloseRef.current = true;
      try {
        sessionRef.current?.close();
      } catch {
        // Ignore teardown errors while the component unmounts.
      }
      void resetSessionState();
    };
  }, [resetSessionState]);

  useEffect(() => {
    // #region debug-point E:ui-state
    reportVoiceSessionDebug("E", "Etat UI assistant", {
      open,
      minimized,
      isSessionActive,
      status,
    });
    // #endregion
  }, [isSessionActive, minimized, open, status]);

  const sendToolResponse = useCallback((
    functionResponse: {
      id?: string;
      name?: string;
      response?: Record<string, unknown>;
    },
  ) => {
    sessionRef.current?.sendToolResponse({
      functionResponses: functionResponse,
    });
  }, []);

  const resolveItem = useCallback((args: Record<string, unknown>) => {
    const context = contextRef.current;
    const barcode = normalize(typeof args.barcode === "string" ? args.barcode : "");
    const query = normalize(typeof args.query === "string" ? args.query : "");

    if (!barcode && !query) {
      throw new Error("Un code-barres ou une recherche est requis.");
    }

    if (barcode) {
      const byBarcode = context.inventory.find(
        (item) => normalize(item.barcode) === barcode,
      );
      if (byBarcode) {
        return byBarcode;
      }
    }

    const matches = context.inventory.filter((item) => {
      const haystack = [
        item.name,
        item.brand,
        item.category,
        item.barcode,
      ].map((value) => normalize(value)).join(" ");
      return haystack.includes(query);
    });

    if (matches.length === 1) {
      return matches[0];
    }

    if (matches.length > 1) {
      const topMatches = matches.slice(0, 3).map((item) => `${item.name} (${item.barcode})`);
      throw new Error(`Plusieurs articles correspondent: ${topMatches.join(", ")}`);
    }

    throw new Error("Aucun article ne correspond a cette demande.");
  }, []);

  const planToolExecution = useCallback((call: {
    id?: string;
    name?: string;
    args?: Record<string, unknown>;
  }): AssistantToolPlan => {
    const args = call.args ?? {};
    const callId = call.id ?? `${call.name ?? "tool"}-${Date.now()}`;
    const toolName = call.name ?? "outil_inconnu";

    switch (toolName) {
      case "get_inventory_overview": {
        return {
          callId,
          toolName,
          summary: "Lecture du resume de stock",
          execute: async () => {
            const context = contextRef.current;
            const limit = typeof args.limit === "number" ? Math.max(1, Math.min(10, Math.round(args.limit))) : 5;
            const onlyLowStock = args.onlyLowStock === true;
            const source = onlyLowStock
              ? context.inventory.filter((item) => item.quantity <= 5)
              : [...context.inventory];
            const topItems = source
              .sort((left, right) => left.quantity - right.quantity || left.name.localeCompare(right.name))
              .slice(0, limit)
              .map((item) => ({
                barcode: item.barcode,
                name: item.name,
                quantity: item.quantity,
                category: item.category ?? null,
              }));

            return {
              activeTab: context.activeTab,
              references: context.inventory.length,
              totalUnits: context.inventory.reduce((sum, item) => sum + item.quantity, 0),
              lowStockCount: context.inventory.filter((item) => item.quantity <= 5).length,
              pendingSyncOperations: context.pendingCount,
              isOnline: context.isOnline,
              items: topItems,
            };
          },
        };
      }

      case "find_inventory_item": {
        return {
          callId,
          toolName,
          summary: "Recherche d'article dans l'inventaire",
          execute: async () => {
            const item = resolveItem(args);
            return {
              barcode: item.barcode,
              name: item.name,
              quantity: item.quantity,
              brand: item.brand ?? null,
              category: item.category ?? null,
              purchasePrice: item.purchasePrice ?? null,
              salesPrice: item.salesPrice ?? null,
              lastUpdated: item.lastUpdated,
            };
          },
        };
      }

      case "navigate_inventory": {
        return {
          callId,
          toolName,
          summary: "Mise a jour de l'interface",
          execute: async () => {
            const nextTab = typeof args.tab === "string" ? args.tab as AppTab : undefined;
            const nextSearch = typeof args.searchTerm === "string" ? args.searchTerm : undefined;
            const nextCategory = typeof args.category === "string" ? args.category : undefined;
            const nextStockFilter = typeof args.stockFilter === "string"
              ? args.stockFilter as StockFilter
              : undefined;
            const nextSortBy = typeof args.sortBy === "string" ? args.sortBy as SortBy : undefined;

            if (nextTab) {
              onSetActiveTab(nextTab);
            }
            if (nextSearch !== undefined) {
              onSetSearchTerm(nextSearch);
            }
            if (nextCategory !== undefined) {
              onSetSelectedCategory(nextCategory || null);
            }
            if (nextStockFilter) {
              onSetStockFilter(nextStockFilter);
            }
            if (nextSortBy) {
              onSetSortBy(nextSortBy);
            }

            return {
              activeTab: nextTab ?? contextRef.current.activeTab,
              searchTerm: nextSearch ?? contextRef.current.searchTerm,
              category: nextCategory ?? contextRef.current.selectedCategory,
              stockFilter: nextStockFilter ?? contextRef.current.stockFilter,
              sortBy: nextSortBy ?? contextRef.current.sortBy,
            };
          },
        };
      }

      case "adjust_stock": {
        const item = resolveItem(args);
        const delta = typeof args.delta === "number" ? Math.trunc(args.delta) : NaN;
        if (!Number.isFinite(delta) || delta === 0) {
          throw new Error("Le delta doit etre un nombre different de zero.");
        }

        return {
          callId,
          toolName,
          summary: `${delta > 0 ? "Ajouter" : "Retirer"} ${Math.abs(delta)} unite(s) a ${item.name}`,
          execute: async () => {
            await onAdjustStock(item.barcode, delta);
            return {
              barcode: item.barcode,
              name: item.name,
              delta,
              status: "updated",
            };
          },
        };
      }

      case "set_stock_quantity": {
        const item = resolveItem(args);
        const quantity = typeof args.quantity === "number" ? Math.max(0, Math.trunc(args.quantity)) : NaN;
        if (!Number.isFinite(quantity)) {
          throw new Error("La quantite cible est invalide.");
        }

        return {
          callId,
          toolName,
          summary: `Definir le stock de ${item.name} a ${quantity}`,
          execute: async () => {
            await onSetQuantity(item.barcode, quantity);
            return {
              barcode: item.barcode,
              name: item.name,
              quantity,
              status: "updated",
            };
          },
        };
      }

      case "delete_inventory_item": {
        const item = resolveItem(args);

        return {
          callId,
          toolName,
          summary: `Supprimer ${item.name} de l'inventaire`,
          execute: async () => {
            await onRemoveItem(item.barcode);
            return {
              barcode: item.barcode,
              name: item.name,
              status: "deleted",
            };
          },
        };
      }

      case "export_inventory_snapshot": {
        return {
          callId,
          toolName,
          summary: "Export de l'inventaire courant",
          execute: async () => {
            onExport();
            return {
              status: "export_started",
              references: contextRef.current.inventory.length,
            };
          },
        };
      }

      default:
        throw new Error(`Outil non supporte: ${toolName}`);
    }
  }, [
    onAdjustStock,
    onExport,
    onRemoveItem,
    onSetActiveTab,
    onSetQuantity,
    onSetSearchTerm,
    onSetSelectedCategory,
    onSetSortBy,
    onSetStockFilter,
    resolveItem,
  ]);

  const handleToolCalls = useCallback(async (functionCalls: Array<{
    id?: string;
    name?: string;
    args?: Record<string, unknown>;
  }>) => {
    for (const call of functionCalls) {
      try {
        const plan = planToolExecution(call);
        const requiresConfirmation = [
          "adjust_stock",
          "set_stock_quantity",
          "delete_inventory_item",
        ].includes(plan.toolName);

        if (requiresConfirmation) {
          setPendingApprovals((current) => [...current, plan]);
          pushHistory("system", `Confirmation requise: ${plan.summary}.`);
          onOpenChange(true);
          onMinimizedChange(false);
          continue;
        }

        const output = await plan.execute();
        sendToolResponse({
          id: plan.callId,
          name: plan.toolName,
          response: { output },
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Execution impossible.";
        sendToolResponse({
          id: call.id,
          name: call.name,
          response: {
            error: {
              message,
            },
          },
        });
      }
    }
  }, [onMinimizedChange, onOpenChange, planToolExecution, pushHistory, sendToolResponse]);

  const handleServerMessage = useCallback((message: {
    setupComplete?: { sessionId?: string };
    serverContent?: {
      modelTurn?: {
        parts?: Array<{
          inlineData?: {
            data?: string;
            mimeType?: string;
          };
        }>;
      };
      interrupted?: boolean;
      inputTranscription?: { text?: string };
      outputTranscription?: { text?: string };
      turnComplete?: boolean;
      generationComplete?: boolean;
      waitingForInput?: boolean;
    };
    toolCall?: {
      functionCalls?: Array<{
        id?: string;
        name?: string;
        args?: Record<string, unknown>;
      }>;
    };
    text?: string;
  }) => {
    // #region debug-point C:server-message
    reportVoiceSessionDebug("C", "Message serveur recu", {
      hasSetupComplete: Boolean(message.setupComplete),
      hasServerContent: Boolean(message.serverContent),
      hasToolCall: Boolean(message.toolCall?.functionCalls?.length),
      hasText: Boolean(message.text?.trim()),
    });
    // #endregion
    if (message.setupComplete?.sessionId) {
      setSessionId(message.setupComplete.sessionId);
    }

    const serverContent = message.serverContent;
    if (!serverContent) {
      if (message.toolCall?.functionCalls?.length) {
        void handleToolCalls(message.toolCall.functionCalls);
      }
      return;
    }

    if (serverContent.interrupted) {
      playerRef.current?.stop();
      draftAssistantRef.current = "";
      setDraftAssistantTranscript("");
      setStatus("listening");
    }

    const inputTranscript = serverContent.inputTranscription?.text?.trim();
    if (inputTranscript) {
      // #region debug-point B:input-transcript
      reportVoiceSessionDebug("B", "Transcription utilisateur recue", {
        textLength: inputTranscript.length,
      });
      // #endregion
      draftUserRef.current = inputTranscript;
      setDraftUserTranscript(inputTranscript);
      setStatus("listening");
    }

    const audioParts = serverContent.modelTurn?.parts ?? [];
    for (const part of audioParts) {
      const inlineData = part.inlineData;
      if (inlineData?.data && inlineData.mimeType?.startsWith("audio/pcm")) {
        // #region debug-point C:output-audio
        reportVoiceSessionDebug("C", "Audio assistant recu", {
          mimeType: inlineData.mimeType,
          dataLength: inlineData.data.length,
        });
        // #endregion
        void playerRef.current?.enqueue(inlineData.data, inlineData.mimeType);
        setStatus("speaking");
      }
    }

    const outputTranscript = serverContent.outputTranscription?.text?.trim()
      || message.text?.trim();
    if (outputTranscript) {
      // #region debug-point C:output-transcript
      reportVoiceSessionDebug("C", "Transcription assistant recue", {
        textLength: outputTranscript.length,
      });
      // #endregion
      if (draftUserRef.current) {
        commitUserDraft();
      }

      draftAssistantRef.current = outputTranscript;
      setDraftAssistantTranscript(outputTranscript);
      setStatus("speaking");
    }

    if (message.toolCall?.functionCalls?.length) {
      void handleToolCalls(message.toolCall.functionCalls);
    }

    if (serverContent.turnComplete || serverContent.generationComplete) {
      commitAssistantDraft();
      if (serverContent.waitingForInput || serverContent.turnComplete) {
        setStatus("listening");
      }
    }
  }, [commitAssistantDraft, commitUserDraft, handleToolCalls]);

  const disconnectSession = useCallback(async (
    userMessage = "Session vocale terminee.",
    closeDrawer = false,
  ) => {
    // #region debug-point E:disconnect-called
    reportVoiceSessionDebug("E", "disconnectSession appele", {
      userMessage,
      closeDrawer,
      hasSession: Boolean(sessionRef.current),
    });
    // #endregion
    manualCloseRef.current = true;

    try {
      sessionRef.current?.sendRealtimeInput({ audioStreamEnd: true });
    } catch {
      // Ignore stream shutdown failures during teardown.
    }

    try {
      sessionRef.current?.close();
    } catch {
      // Ignore close errors on already closed sessions.
    }

    await resetSessionState();
    setStatus("idle");
    setSessionError(null);
    pushHistory("system", userMessage);

    if (closeDrawer) {
      onOpenChange(false);
      onMinimizedChange(false);
    }
  }, [onMinimizedChange, onOpenChange, pushHistory, resetSessionState]);

  const connectSession = useCallback(async () => {
    // #region debug-point C:connect-start
    reportVoiceSessionDebug("C", "Tentative de connexion session", {
      hasApiKey: Boolean(GEMINI_API_KEY),
      model: GEMINI_LIVE_MODEL,
      alreadyActive: isSessionActive,
      status,
    });
    // #endregion
    if (!GEMINI_API_KEY) {
      const message = "Ajoute VITE_GEMINI_API_KEY pour activer Julien.";
      setStatus("error");
      setSessionError(message);
      showToast(message);
      onOpenChange(true);
      onMinimizedChange(false);
      return;
    }

    if (isSessionActive || status === "connecting") {
      return;
    }

    setStatus("connecting");
    setSessionError(null);
    setHistory([
      createHistoryItem(
        "assistant",
        "Connexion de Julien en cours. Parle des que le micro est actif.",
      ),
    ]);
    setPendingApprovals([]);
    clearDrafts();
    sentAudioChunkCountRef.current = 0;

    try {
      // #region debug-point C:player-init
      reportVoiceSessionDebug("C", "Initialisation player audio");
      // #endregion
      const player = new PcmAudioPlayer();
      playerRef.current = player;

      // #region debug-point C:genai-init
      reportVoiceSessionDebug("C", "Initialisation GoogleGenAI");
      // #endregion
      const ai = new GoogleGenAI({
        apiKey: GEMINI_API_KEY,
        apiVersion: "v1alpha",
      });

      // #region debug-point C:live-connect
      reportVoiceSessionDebug("C", "Connexion a Gemini Live");
      // #endregion
      const session = await ai.live.connect({
        model: GEMINI_LIVE_MODEL,
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            languageCode: "fr-FR",
          },
          systemInstruction: {
            parts: [
              {
                text: buildGeminiAssistantSystemPrompt(promptContext),
              },
            ],
          },
          tools: assistantTools,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
          realtimeInputConfig: {
            activityHandling: ActivityHandling.START_OF_ACTIVITY_INTERRUPTS,
          },
        },
        callbacks: {
          onopen: () => {
            // #region debug-point C:onopen
            reportVoiceSessionDebug("C", "Connexion Gemini ouverte");
            // #endregion
            setStatus("listening");
            setIsSessionActive(true);
            pushHistory("system", "Julien est connecte et ecoute.");
          },
          onmessage: handleServerMessage,
          onerror: (event) => {
            // #region debug-point E:onerror
            reportVoiceSessionDebug("E", "Erreur session Gemini", {
              message: event.error?.message ?? null,
            });
            // #endregion
            const message = event.error?.message
              ?? "Une erreur est survenue pendant la session vocale.";
            setStatus("error");
            setSessionError(message);
            showToast(message);
          },
          onclose: (event) => {
            // #region debug-point E:onclose
            reportVoiceSessionDebug("E", "Connexion Gemini fermee", {
              manualClose: manualCloseRef.current,
              code: event.code,
              reason: event.reason,
              wasClean: event.wasClean,
            });
            // #endregion
            const wasManualClose = manualCloseRef.current;
            manualCloseRef.current = false;
            void resetSessionState();

            if (!wasManualClose) {
              setStatus("idle");
              setSessionError("La session vocale a ete fermee.");
              pushHistory("system", "La session vocale a ete fermee.");
              showToast("La session vocale a ete fermee.");
            }
          },
        },
      });

      sessionRef.current = session;
      // #region debug-point A:mic-start
      reportVoiceSessionDebug("A", "Demarrage du flux microphone");
      // #endregion

      const micStream = await startMicrophonePcmStream((chunk) => {
        sentAudioChunkCountRef.current += 1;
        if (sentAudioChunkCountRef.current === 1 || sentAudioChunkCountRef.current % 50 === 0) {
          // #region debug-point B:audio-send
          reportVoiceSessionDebug("B", "Chunk audio envoye a Gemini", {
            chunkCount: sentAudioChunkCountRef.current,
            blobSize: chunk.size,
            mimeType: chunk.type,
          });
          // #endregion
        }
        sessionRef.current?.sendRealtimeInput({
          audio: chunk,
        });
      });

      micStreamRef.current = micStream;
      setIsSessionActive(true);
      onOpenChange(true);
      onMinimizedChange(false);
      // #region debug-point C:session-ready
      reportVoiceSessionDebug("C", "Session prete");
      // #endregion
    } catch (error) {
      const message = error instanceof Error
        ? error.message
        : "Impossible de demarrer la session Gemini Live.";
      // #region debug-point E:connect-catch
      reportVoiceSessionDebug("E", "Erreur pendant connexion session", {
        message,
      });
      // #endregion
      await resetSessionState();
      setStatus("error");
      setSessionError(message);
      showToast(message);
      pushHistory("system", message);
    }
  }, [
    clearDrafts,
    handleServerMessage,
    isSessionActive,
    onMinimizedChange,
    onOpenChange,
    promptContext,
    pushHistory,
    resetSessionState,
    showToast,
    status,
  ]);

  const sendTypedMessage = useCallback((event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = typedMessage.trim();
    if (!trimmed || !sessionRef.current) {
      return;
    }

    sessionRef.current.sendClientContent({
      turns: {
        role: "user",
        parts: [{ text: trimmed }],
      },
      turnComplete: true,
    });

    pushHistory("user", trimmed);
    setTypedMessage("");
    setStatus("speaking");
  }, [pushHistory, typedMessage]);

  const currentApproval = pendingApprovals[0] ?? null;

  const approvePendingAction = useCallback(async () => {
    if (!currentApproval) {
      return;
    }

    try {
      const output = await currentApproval.execute();
      sendToolResponse({
        id: currentApproval.callId,
        name: currentApproval.toolName,
        response: { output },
      });
      pushHistory("system", `Action confirmee: ${currentApproval.summary}.`);
      showToast("Action executee");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Execution impossible.";
      sendToolResponse({
        id: currentApproval.callId,
        name: currentApproval.toolName,
        response: {
          error: {
            message,
          },
        },
      });
      pushHistory("system", `Echec de l'action: ${message}`);
      showToast(message);
    } finally {
      setPendingApprovals((current) => current.slice(1));
    }
  }, [currentApproval, pushHistory, sendToolResponse, showToast]);

  const declinePendingAction = useCallback(() => {
    if (!currentApproval) {
      return;
    }

    sendToolResponse({
      id: currentApproval.callId,
      name: currentApproval.toolName,
      response: {
        error: {
          code: "USER_DECLINED",
          message: "Action refusee par l'utilisateur.",
        },
      },
    });
    pushHistory("system", `Action refusee: ${currentApproval.summary}.`);
    setPendingApprovals((current) => current.slice(1));
  }, [currentApproval, pushHistory, sendToolResponse]);

  const bubbleText = currentApproval?.summary
    ?? draftAssistantTranscript
    ?? draftUserTranscript
    ?? history[history.length - 1]?.text
    ?? "Session vocale active";

  const headerStatusLabel = status === "connecting"
    ? "Connexion..."
    : status === "speaking"
      ? "Julien parle"
      : status === "error"
        ? "Erreur"
        : isSessionActive
          ? "Julien ecoute"
          : "Hors ligne";

  const showFloatingBubble = minimized && isSessionActive && !open;

  return (
    <>
      {showFloatingBubble && (
        <button
          type="button"
          onClick={() => {
            onOpenChange(true);
            onMinimizedChange(false);
          }}
          className="fixed right-3 z-50 flex w-[min(22rem,calc(100vw-1.5rem))] items-center gap-3 rounded-3xl border border-indigo-200 bg-white/95 px-3 py-3 text-left shadow-2xl shadow-stone-900/15 backdrop-blur"
          style={{ bottom: "calc(6.25rem + env(safe-area-inset-bottom))" }}
        >
          <div className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
            <AudioLines className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              Julien actif
            </p>
            <p className="truncate text-sm font-semibold text-stone-900">{bubbleText}</p>
          </div>
          <span className="rounded-full bg-indigo-50 px-2 py-1 text-[10px] font-bold text-indigo-700">
            {headerStatusLabel}
          </span>
        </button>
      )}

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-stone-950/30 backdrop-blur-[1px]">
          <button
            type="button"
            aria-label="Fermer le drawer vocal"
            className="absolute inset-0"
            onClick={() => {
              onOpenChange(false);
              onMinimizedChange(isSessionActive);
            }}
          />

          <section className="relative z-10 flex max-h-[88dvh] w-full max-w-2xl flex-col overflow-hidden rounded-t-[2rem] border border-stone-200 bg-[#f7f5f0] shadow-2xl shadow-stone-900/20">
            <div className="mx-auto mt-3 h-1.5 w-14 rounded-full bg-stone-300" />

            <header className="border-b border-stone-200 px-4 pb-4 pt-4 sm:px-5">
              <div className="flex items-start gap-3">
                <div className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-white shadow-lg shadow-indigo-600/25">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-extrabold tracking-tight text-stone-950">
                      Assistant vocal Julien
                    </h2>
                    <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      Gemini Live
                    </span>
                  </div>

                  <p className="mt-1 text-sm font-medium text-stone-600">
                    {headerStatusLabel}
                    {sessionId ? ` · session ${sessionId.slice(0, 8)}` : ""}
                  </p>
                  {sessionError && (
                    <p className="mt-1 text-xs font-semibold text-rose-600">{sessionError}</p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {isSessionActive && (
                    <button
                      type="button"
                      onClick={() => {
                        onOpenChange(false);
                        onMinimizedChange(true);
                      }}
                      className="touch-target grid h-10 w-10 place-items-center rounded-2xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:border-stone-300 hover:text-stone-900"
                      aria-label="Minimiser Julien"
                    >
                      <Minimize2 className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      onOpenChange(false);
                      onMinimizedChange(isSessionActive);
                    }}
                    className="touch-target grid h-10 w-10 place-items-center rounded-2xl border border-stone-200 bg-white text-stone-600 shadow-sm transition hover:border-stone-300 hover:text-stone-900"
                    aria-label="Fermer Julien"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                <StatChip label="Onglet" value={formatTabLabel(activeTab)} />
                <StatChip label="Refs" value={String(inventory.length)} />
                <StatChip
                  label="Synchro"
                  value={!isOnline ? "offline" : pendingCount > 0 ? `${pendingCount} attente` : "ok"}
                />
                <StatChip
                  label="Alerte"
                  value={String(inventory.filter((item) => item.quantity <= 5).length)}
                />
              </div>
            </header>

            <div className="flex-1 overflow-y-auto px-4 py-4 sm:px-5">
              <div className="flex flex-col gap-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className={`max-w-[88%] rounded-2xl border px-3 py-2 text-sm font-medium shadow-sm ${historyBubbleClasses(item.speaker)}`}
                  >
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-70">
                      {item.speaker === "assistant"
                        ? "Julien"
                        : item.speaker === "user"
                          ? "Vous"
                          : "Systeme"}
                    </p>
                    <p>{item.text}</p>
                  </div>
                ))}

                {draftUserTranscript && (
                  <div className="max-w-[88%] self-end rounded-2xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-950 shadow-sm">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Vous · transcription
                    </p>
                    <p>{draftUserTranscript}</p>
                  </div>
                )}

                {draftAssistantTranscript && (
                  <div className="max-w-[88%] self-start rounded-2xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-950 shadow-sm">
                    <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                      Julien · en cours
                    </p>
                    <p>{draftAssistantTranscript}</p>
                  </div>
                )}

                {!isSessionActive && status !== "connecting" && (
                  <div className="rounded-3xl border border-dashed border-stone-300 bg-white/80 p-4 text-sm text-stone-600">
                    <div className="flex items-start gap-3">
                      <Bot className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />
                      <div>
                        <p className="font-bold text-stone-900">Pret a demarrer</p>
                        <p className="mt-1">
                          Julien peut repondre a l'oral, transcrire en direct et proposer des actions
                          avec confirmation avant toute modification sensible du stock.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={historyEndRef} />
              </div>
            </div>

            <footer className="border-t border-stone-200 bg-white/70 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:px-5">
              {currentApproval && (
                <div className="mb-4 rounded-3xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-amber-100 text-amber-700">
                      <ShieldAlert className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-amber-700">
                        Confirmation requise
                      </p>
                      <p className="mt-1 text-sm font-semibold text-amber-950">
                        {currentApproval.summary}
                      </p>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={approvePendingAction}
                      className="flex-1 rounded-2xl bg-amber-600 px-4 py-3 text-sm font-bold text-white shadow-sm transition hover:bg-amber-700"
                    >
                      Confirmer
                    </button>
                    <button
                      type="button"
                      onClick={declinePendingAction}
                      className="flex-1 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm font-bold text-amber-900 transition hover:border-amber-300"
                    >
                      Refuser
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_auto]">
                <form onSubmit={sendTypedMessage} className="flex min-w-0 gap-2">
                  <input
                    type="text"
                    value={typedMessage}
                    onChange={(event) => setTypedMessage(event.target.value)}
                    placeholder={isSessionActive ? "Ecrire a Julien..." : "Demarre la session vocale d'abord"}
                    disabled={!isSessionActive}
                    className="h-12 min-w-0 flex-1 rounded-2xl border border-stone-200 bg-white px-4 text-sm font-semibold text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-indigo-500 disabled:cursor-not-allowed disabled:bg-stone-100"
                  />
                  <button
                    type="submit"
                    disabled={!isSessionActive || typedMessage.trim().length === 0}
                    className="touch-target grid h-12 w-12 place-items-center rounded-2xl bg-indigo-600 text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-stone-300"
                    aria-label="Envoyer un message a Julien"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                {isSessionActive ? (
                  <button
                    type="button"
                    onClick={() => void disconnectSession("Session vocale arretee.", true)}
                    className="touch-target inline-flex h-12 items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 text-sm font-bold text-rose-700 transition hover:bg-rose-100"
                  >
                    <MicOff className="h-4 w-4" />
                    Couper
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void connectSession()}
                    disabled={status === "connecting"}
                    className="touch-target inline-flex h-12 items-center justify-center gap-2 rounded-2xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                  >
                    {status === "connecting" ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                    Demarrer
                  </button>
                )}

                <div className="hidden h-12 items-center justify-end gap-2 rounded-2xl border border-stone-200 bg-white px-4 text-xs font-semibold text-stone-600 sm:flex">
                  {status === "speaking" ? <Volume2 className="h-4 w-4 text-indigo-600" /> : <AudioLines className="h-4 w-4 text-emerald-600" />}
                  <span>{headerStatusLabel}</span>
                </div>
              </div>
            </footer>
          </section>
        </div>
      )}
    </>
  );
}

function StatChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-stone-200 bg-white/80 px-3 py-2 shadow-sm">
      <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">{label}</p>
      <p className="mt-1 truncate text-sm font-extrabold text-stone-950">{value}</p>
    </div>
  );
}
