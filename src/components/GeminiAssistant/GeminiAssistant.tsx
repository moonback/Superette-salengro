import { GeminiDrawer } from './GeminiDrawer';
import { FloatingBubble } from './FloatingBubble';
import { PermissionDialog } from './PermissionDialog';
import type { PermissionRequest } from './types';
import { AssistantState } from './types';

interface Props {
  state: AssistantState;
  isOpen: boolean;
  isMinimized: boolean;
  isMuted: boolean;
  error: string | null;
  permission: PermissionRequest | null;
  onOpen: () => void;
  onClose: () => void;
  onMinimize: () => void;
  onMuteToggle: () => void;
  onStop: () => void;
  onPermission: (allowed: boolean) => void;
}

export function GeminiAssistant(props: Props) {
  return (
    <>
      {props.isOpen && !props.isMinimized && (
        <GeminiDrawer state={props.state} isMuted={props.isMuted} error={props.error} onMinimize={props.onMinimize} onClose={props.onClose} onMuteToggle={props.onMuteToggle} onStop={props.onStop} />
      )}
      {props.isOpen && props.isMinimized && <FloatingBubble state={props.state} onExpand={props.onOpen} />}
      <PermissionDialog isOpen={Boolean(props.permission)} toolName={props.permission?.toolName ?? ''} description={props.permission?.description ?? ''} args={props.permission?.args ?? {}} onConfirm={() => props.onPermission(true)} onDeny={() => props.onPermission(false)} />
    </>
  );
}
