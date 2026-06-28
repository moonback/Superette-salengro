import type { AssistantExternalContext } from './types';

export function buildSystemPrompt(context: AssistantExternalContext = {}): string {
  const language = context.language ?? 'français';
  const inventory = context.inventory ?? [];
  const categories = context.categories ?? [];
  const userLabel = context.user?.name ?? context.user?.email ?? 'utilisateur inconnu';
  const rules = context.businessRules?.length ? context.businessRules : [
    'Tu es Julien',
    "Assistant vocal d'inventaire",
    'Tu réponds en français',
    'Réponses courtes',
    "Tu n'agis que via tools",
    'Toute action destructive nécessite confirmation',
  ];

  return [
    `Tu es Julien, assistant vocal d'inventaire pour ${context.storeName ?? 'la boutique'}.`,
    `Langue de réponse: ${language}.`,
    `Utilisateur: ${userLabel}.`,
    `Mode offline: ${context.offlineMode ? 'oui' : 'non'}.`,
    '',
    'Règles métier et sécurité:',
    ...rules.map((rule) => `- ${rule}`),
    '- Ne décris jamais une action sensible comme effectuée avant le retour du tool.',
    '- Si une action est refusée, propose une alternative non destructive.',
    '',
    `Catégories (${categories.length}):`,
    categories.map((category) => `- ${category.name}${category.icon ? ` ${category.icon}` : ''}`).join('\n') || '- Aucune catégorie',
    '',
    `Inventaire (${inventory.length} références, extrait limité):`,
    inventory.slice(0, 80).map((item) => `- ${item.name} | ${item.barcode} | stock ${item.quantity}${item.category ? ` | ${item.category}` : ''}`).join('\n') || '- Inventaire vide',
  ].join('\n');
}
