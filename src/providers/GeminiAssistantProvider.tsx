import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import type { InventoryProductSnapshot } from '../components/GeminiAssistant/types';
import { GeminiAssistant } from '../components/GeminiAssistant/GeminiAssistant';
import { AudioManager } from '../components/GeminiAssistant/AudioManager';
import { FunctionDispatcher } from '../components/GeminiAssistant/FunctionDispatcher';
import { LiveSession } from '../components/GeminiAssistant/LiveSession';
import type { AssistantExternalContext, GeminiAssistantContextValue, GeminiAssistantProviderProps, PermissionRequest } from '../components/GeminiAssistant/types';
import { AssistantState } from '../components/GeminiAssistant/types';
import { registerAssistantSpeaker } from '../components/GeminiAssistant/assistantBridge';
import { speakAssistantText } from '../components/GeminiAssistant/assistantBridge';

export const GeminiAssistantContext = createContext<GeminiAssistantContextValue | null>(null);

const emptyContext = async (): Promise<AssistantExternalContext> => ({ language: 'français', offlineMode: !navigator.onLine });

export function GeminiAssistantProvider({ children, getContext = emptyContext, toolHandlers = {}, autoRender = true }: GeminiAssistantProviderProps) {
  const [state, setState] = useState(AssistantState.Idle);
  const [isOpen, setOpen] = useState(false);
  const [isMinimized, setMinimized] = useState(false);
  const [isMuted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionRequest | null>(null);
  const [autoAccept, setAutoAccept] = useState(true);
  const autoAcceptRef = useRef(autoAccept);
  const audio = useRef(AudioManager.getInstance());
  const session = useRef<LiveSession | null>(null);
  const activeProductRef = useRef<AssistantExternalContext['activeProduct']>(null);

  // Mettre à jour le ref quand autoAccept change
  autoAcceptRef.current = autoAccept;

  const readContext = useCallback(async () => {
    const baseContext = await getContext();
    const activeProduct = activeProductRef.current ?? baseContext.activeProduct ?? null;
    return {
      ...baseContext,
      activeProduct,
    };
  }, [getContext]);

  const askPermission = useCallback((request: Omit<PermissionRequest, 'id' | 'resolve'>) => new Promise<boolean>((resolve) => {
    if (autoAcceptRef.current) {
      resolve(true);
      return;
    }
    setPermission({ ...request, id: crypto.randomUUID(), resolve });
  }), []);

  const resolvePermission = useCallback((allowed: boolean) => {
    permission?.resolve(allowed);
    setPermission(null);
  }, [permission]);

  const rememberProduct = useCallback((product: AssistantExternalContext['activeProduct']) => {
    activeProductRef.current = product ?? null;
  }, []);

  const speakText = useCallback((text: string) => {
    if (!session.current?.isConnected()) {
      return;
    }
    session.current.sendText(text);
  }, []);

  useMemo(() => {
    registerAssistantSpeaker(speakText);
  }, [speakText]);

  const open = useCallback(async () => {
    setOpen(true);
    setMinimized(false);
    setError(null);
    if (session.current?.isConnected()) {
      return;
    }
    setState(AssistantState.Connecting);
    try {
      const dispatcher = new FunctionDispatcher(toolHandlers, askPermission, readContext);
      const currentContext = await readContext();
      session.current = new LiveSession(audio.current, {
        onOpen: () => setState(AssistantState.Listening),
        onClose: () => setState(AssistantState.Idle),
        onAudio: () => setState(AssistantState.Speaking),
        onThinking: () => setState(AssistantState.Thinking),
        onFunctionCall: async (call) => {
          const result = await dispatcher.dispatch(call);
          if (call.name === 'searchProduct') {
            const product = (result.response.data as { product?: InventoryProductSnapshot } | undefined)?.product;
            if (product) {
              rememberProduct({
                name: product.name,
                barcode: product.barcode,
                brand: product.brand,
              });
            }
          }
          return result;
        },
        onError: (message) => { setError(message); setState(AssistantState.Error); },
      });
      await session.current.connect(currentContext);
      await session.current.startAudio();
      setState(AssistantState.Listening);
      // Play a short welcome message when Lina is opened
      try {
        speakAssistantText('Bonjour, Demande comment je peux t’aider !');
      } catch (e) {
        // ignore speak errors
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur assistant vocal');
      setState(AssistantState.Error);
    }
  }, [askPermission, readContext, toolHandlers, rememberProduct]);

  const close = useCallback(async () => {
    await session.current?.disconnect();
    session.current = null;
    activeProductRef.current = null;
    setOpen(false);
    setMinimized(false);
    setState(AssistantState.Idle);
  }, []);

  const minimize = useCallback(() => setMinimized(true), []);
  const expand = useCallback(() => { setOpen(true); setMinimized(false); }, []);
  const mute = useCallback(() => { audio.current.setMuted(true); setMuted(true); setState(AssistantState.Muted); }, []);
  const unmute = useCallback(() => { audio.current.setMuted(false); setMuted(false); setState(AssistantState.Listening); }, []);
  const stop = useCallback(async () => { await close(); }, [close]);

  const value = useMemo<GeminiAssistantContextValue>(() => ({ state, isOpen, isMinimized, isMuted, error, autoAccept, setAutoAccept, open, close, minimize, expand, mute, unmute, stop }), [state, isOpen, isMinimized, isMuted, error, autoAccept, setAutoAccept, open, close, minimize, expand, mute, unmute, stop]);

  return (
    <GeminiAssistantContext.Provider value={value}>
      {children}
      {autoRender && <GeminiAssistant state={state} isOpen={isOpen} isMinimized={isMinimized} isMuted={isMuted} error={error} autoAccept={autoAccept} setAutoAccept={setAutoAccept} permission={permission} onOpen={() => void open()} onClose={() => void close()} onMinimize={minimize} onMuteToggle={isMuted ? unmute : mute} onStop={() => void stop()} onPermission={resolvePermission} />}
    </GeminiAssistantContext.Provider>
  );
}
