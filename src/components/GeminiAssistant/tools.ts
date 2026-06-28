import type { ToolDefinition } from './types';

export const tools: ToolDefinition[] = [
  { name: 'searchProduct', description: 'Recherche un produit et renvoie sa fiche complete', parameters: { type: 'object', properties: { query: { type: 'string' } }, required: ['query'] } },
  { name: 'openProductDetails', description: "Ouvrir la fiche detaillee mobile d'un produit present dans l'inventaire", parameters: { type: 'object', properties: { query: { type: 'string' }, barcode: { type: 'string' } } } },
  { name: 'updateStock', description: 'Modifier un stock', sensitive: true, parameters: { type: 'object', properties: { barcode: { type: 'string' }, quantity: { type: 'number' } }, required: ['barcode', 'quantity'] } },
  {
    name: 'updateProduct',
    description: 'Modifier un produit (prix, nom, marque, categorie, etc.)',
    sensitive: true,
    parameters: {
      type: 'object',
      properties: {
        barcode: { type: 'string', description: 'Code-barres du produit (obligatoire)' },
        name: { type: 'string', description: 'Nouveau nom du produit' },
        brand: { type: 'string', description: 'Nouvelle marque du produit' },
        category: { type: 'string', description: 'Nouvelle categorie du produit' },
        purchasePrice: { type: 'number', description: 'Nouveau prix d\'achat' },
        salesPrice: { type: 'number', description: 'Nouveau prix de vente' },
        imageUrl: { type: 'string', description: 'Nouvelle URL de l\'image' },
      },
      required: ['barcode'],
    },
  },
  {
    name: 'createProduct',
    description: 'Creer un produit dans l inventaire a partir d un code-barres ou d un nom avec marque, en recherchant OpenFoodFacts',
    sensitive: true,
    parameters: {
      type: 'object',
      properties: {
        barcode: { type: 'string', description: 'Code-barres du produit si disponible' },
        name: { type: 'string', description: 'Nom du produit si le code-barres n est pas fourni' },
        quantity: { type: 'number' },
        brand: { type: 'string', description: 'Marque du produit, requise si le code-barres n est pas fourni' },
        category: { type: 'string' },
        imageUrl: { type: 'string' },
        purchasePrice: { type: 'number' },
        salesPrice: { type: 'number' },
      },
    },
  },
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
