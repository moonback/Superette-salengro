import type { ReactNode } from 'react';

export enum AssistantState {
  Idle = 'idle',
  Connecting = 'connecting',
  Listening = 'listening',
  Speaking = 'speaking',
  Thinking = 'thinking',
  Muted = 'muted',
  Error = 'error',
}

export type ToolName =
  | 'searchProduct'
  | 'updateStock'
  | 'createCategory'
  | 'renameCategory'
  | 'deleteProduct'
  | 'exportCSV';

export interface GeminiToolCall {
  id: string;
  name: ToolName | string;
  args: Record<string, unknown>;
}

export interface GeminiToolResult {
  id: string;
  name: string;
  response: { success: boolean; data?: unknown; error?: string; denied?: boolean };
}

export interface ToolDefinition {
  name: ToolName;
  description: string;
  parameters?: Record<string, unknown>;
  sensitive?: boolean;
}

export interface InventoryProductSnapshot {
  barcode: string;
  name: string;
  quantity: number;
  category?: string;
  brand?: string;
}

export interface InventoryCategorySnapshot {
  id?: string;
  name: string;
  icon?: string;
}

export interface AssistantExternalContext {
  inventory?: InventoryProductSnapshot[];
  categories?: InventoryCategorySnapshot[];
  user?: { id?: string; name?: string; email?: string; role?: string };
  language?: string;
  offlineMode?: boolean;
  businessRules?: string[];
  storeName?: string;
}

export type ExternalContextReader = () => AssistantExternalContext | Promise<AssistantExternalContext>;

export type ToolHandler = (args: Record<string, unknown>, ctx: AssistantExternalContext) => unknown | Promise<unknown>;

export type ToolHandlers = Partial<Record<ToolName, ToolHandler>>;

export interface PermissionRequest {
  id: string;
  toolName: string;
  description: string;
  args: Record<string, unknown>;
  resolve: (allowed: boolean) => void;
}

export interface GeminiAssistantContextValue {
  state: AssistantState;
  isOpen: boolean;
  isMinimized: boolean;
  isMuted: boolean;
  error: string | null;
  open: () => Promise<void>;
  close: () => Promise<void>;
  minimize: () => void;
  expand: () => void;
  mute: () => void;
  unmute: () => void;
  stop: () => Promise<void>;
}

export interface GeminiAssistantProviderProps {
  children: ReactNode;
  getContext?: ExternalContextReader;
  toolHandlers?: ToolHandlers;
  autoRender?: boolean;
}
