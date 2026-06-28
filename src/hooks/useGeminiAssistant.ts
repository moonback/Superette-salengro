import { useContext } from 'react';
import { GeminiAssistantContext } from '../providers/GeminiAssistantProvider';

export function useGeminiAssistant() {
  const context = useContext(GeminiAssistantContext);
  if (!context) throw new Error('useGeminiAssistant must be used within a GeminiAssistantProvider');
  return context;
}
