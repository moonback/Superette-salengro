import type { ToolDefinition } from './types';

export const tools: ToolDefinition[] = [
  { name: 'searchProduct', description: 'Recherche un produit', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'updateStock', description: 'Modifier un stock', sensitive: true, parameters: { type: 'object', properties: { barcode: { type: 'string' }, quantity: { type: 'number' } }, required: ['barcode', 'quantity'] } },
  { name: 'createCategory', description: 'Créer une catégorie', sensitive: true, parameters: { type: 'object', properties: { name: { type: 'string' } }, required: ['name'] } },
  { name: 'renameCategory', description: 'Renommer une catégorie', sensitive: true, parameters: { type: 'object', properties: { oldName: { type: 'string' }, newName: { type: 'string' } }, required: ['oldName', 'newName'] } },
  { name: 'deleteProduct', description: 'Supprimer un produit', sensitive: true, parameters: { type: 'object', properties: { barcode: { type: 'string' } }, required: ['barcode'] } },
  { name: 'exportCSV', description: 'Exporter en CSV', sensitive: true, parameters: { type: 'object', properties: {} } },
];

export const sensitiveTools = new Set(tools.filter((tool) => tool.sensitive).map((tool) => tool.name));

export function isSensitiveTool(name: string): boolean {
  return sensitiveTools.has(name as never);
}

export function getToolDescription(name: string): string {
  return tools.find((tool) => tool.name === name)?.description ?? `Action ${name}`;
}

export function getToolsDeclaration(): Array<Record<string, unknown>> {
  return tools.map(({ name, description, parameters }) => ({ name, description, parameters: parameters ?? { type: 'object', properties: {} } }));
}

export const TOOLS = tools;
export const isDestructiveTool = isSensitiveTool;
