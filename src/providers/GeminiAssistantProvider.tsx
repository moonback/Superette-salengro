import { createContext, useCallback, useMemo, useRef, useState } from 'react';
import { GeminiAssistant } from '../components/GeminiAssistant/GeminiAssistant';
import { AudioManager } from '../components/GeminiAssistant/AudioManager';
import { FunctionDispatcher } from '../components/GeminiAssistant/FunctionDispatcher';
import { LiveSession } from '../components/GeminiAssistant/LiveSession';
import type { AssistantExternalContext, GeminiAssistantContextValue, GeminiAssistantProviderProps, PermissionRequest } from '../components/GeminiAssistant/types';
import { AssistantState } from '../components/GeminiAssistant/types';

const LOG_PREFIX = '[GeminiAssistant][Provider]';

export const GeminiAssistantContext = createContext<GeminiAssistantContextValue | null>(null);

const emptyContext = async (): Promise<AssistantExternalContext> => ({ language: 'français', offlineMode: !navigator.onLine });

export function GeminiAssistantProvider({ children, getContext = emptyContext, toolHandlers = {}, autoRender = true }: GeminiAssistantProviderProps) {
  const [state, setState] = useState(AssistantState.Idle);
  const [isOpen, setOpen] = useState(false);
  const [isMinimized, setMinimized] = useState(false);
  const [isMuted, setMuted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<PermissionRequest | null>(null);
  const audio = useRef(AudioManager.getInstance());
  const session = useRef<LiveSession | null>(null);

  const readContext = useCallback(async () => {
    const context = await getContext();
    console.info(LOG_PREFIX, 'Contexte externe lu', { inventoryCount: context.inventory?.length ?? 0, categoriesCount: context.categories?.length ?? 0, offlineMode: context.offlineMode, language: context.language });
    return context;
  }, [getContext]);

  const askPermission = useCallback((request: Omit<PermissionRequest, 'id' | 'resolve'>) => new Promise<boolean>((resolve) => {
    console.info(LOG_PREFIX, 'Ouverture PermissionDialog', { toolName: request.toolName, args: request.args });
    setPermission({ ...request, id: crypto.randomUUID(), resolve });
  }), []);

  const resolvePermission = useCallback((allowed: boolean) => {
    console.info(LOG_PREFIX, 'PermissionDialog résolue', { toolName: permission?.toolName, allowed });
    permission?.resolve(allowed);
    setPermission(null);
  }, [permission]);

  const open = useCallback(async () => {
    console.info(LOG_PREFIX, 'open() appelé');
    setOpen(true);
    setMinimized(false);
    setError(null);
    if (session.current?.isConnected()) {
      console.info(LOG_PREFIX, 'Session déjà connectée, ouverture UI uniquement');
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
        onFunctionCall: (call) => dispatcher.dispatch(call),
        onError: (message) => { setError(message); setState(AssistantState.Error); },
      });
      console.info(LOG_PREFIX, 'Connexion session Live');
      await session.current.connect(currentContext);
      console.info(LOG_PREFIX, 'Démarrage micro après connexion Live');
      await session.current.startAudio();
      setState(AssistantState.Listening);
    } catch (err) {
      console.error(LOG_PREFIX, 'open() en erreur', err);
      setError(err instanceof Error ? err.message : 'Erreur assistant vocal');
      setState(AssistantState.Error);
    }
  }, [askPermission, readContext, toolHandlers]);

  const close = useCallback(async () => {
    console.info(LOG_PREFIX, 'close() appelé');
    await session.current?.disconnect();
    session.current = null;
    setOpen(false);
    setMinimized(false);
    setState(AssistantState.Idle);
  }, []);

  const minimize = useCallback(() => setMinimized(true), []);
  const expand = useCallback(() => { setOpen(true); setMinimized(false); }, []);
  const mute = useCallback(() => { console.info(LOG_PREFIX, 'mute() appelé'); audio.current.setMuted(true); setMuted(true); setState(AssistantState.Muted); }, []);
  const unmute = useCallback(() => { console.info(LOG_PREFIX, 'unmute() appelé'); audio.current.setMuted(false); setMuted(false); setState(AssistantState.Listening); }, []);
  const stop = useCallback(async () => { await close(); }, [close]);

  const value = useMemo<GeminiAssistantContextValue>(() => ({ state, isOpen, isMinimized, isMuted, error, open, close, minimize, expand, mute, unmute, stop }), [state, isOpen, isMinimized, isMuted, error, open, close, minimize, expand, mute, unmute, stop]);

  return (
    <GeminiAssistantContext.Provider value={value}>
      {children}
      {autoRender && <GeminiAssistant state={state} isOpen={isOpen} isMinimized={isMinimized} isMuted={isMuted} error={error} permission={permission} onOpen={() => void open()} onClose={() => void close()} onMinimize={minimize} onMuteToggle={isMuted ? unmute : mute} onStop={() => void stop()} onPermission={resolvePermission} />}
    </GeminiAssistantContext.Provider>
  );
}
