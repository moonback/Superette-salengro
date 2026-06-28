import type { AssistantExternalContext, GeminiToolCall, GeminiToolResult, ToolHandlers } from './types';
import { getToolDescription, isSensitiveTool, tools } from './tools';

const LOG_PREFIX = '[GeminiAssistant][FunctionDispatcher]';

export type PermissionAsker = (request: Omit<GeminiToolCall, 'id'> & { description: string }) => Promise<boolean>;

export class FunctionDispatcher {
  constructor(
    private readonly handlers: ToolHandlers = {},
    private readonly askPermission: PermissionAsker,
    private readonly readContext: () => Promise<AssistantExternalContext>,
  ) {}

  async dispatch(call: GeminiToolCall): Promise<GeminiToolResult> {
    console.info(LOG_PREFIX, 'Dispatch tool demandé', { id: call.id, name: call.name, args: call.args });
    const tool = tools.find((candidate) => candidate.name === call.name);
    if (!tool) {
      console.error(LOG_PREFIX, 'Tool inconnu', { name: call.name });
      return this.error(call, `Tool inconnu: ${call.name}`);
    }

    if (isSensitiveTool(call.name)) {
      console.info(LOG_PREFIX, 'Permission utilisateur requise', { name: call.name });
      const allowed = await this.askPermission({ name: call.name, args: call.args, description: getToolDescription(call.name) });
      console.info(LOG_PREFIX, 'Décision permission utilisateur', { name: call.name, allowed });
      if (!allowed) return { id: call.id, name: call.name, response: { success: false, denied: true, error: 'Action refusée par l’utilisateur' } };
    }

    const context = await this.readContext();
    const handler = this.handlers[tool.name];

    if (handler) {
      try {
        console.info(LOG_PREFIX, 'Handler application appelé', { name: tool.name });
        const data = await handler(call.args, context);
        console.info(LOG_PREFIX, 'Handler application terminé', { name: tool.name, data });
        return { id: call.id, name: call.name, response: { success: true, data } };
      } catch (err) {
        console.error(LOG_PREFIX, 'Handler application en erreur', { name: tool.name, error: err });
        return this.error(call, err instanceof Error ? err.message : 'Erreur tool');
      }
    }

    if (tool.name === 'searchProduct') {
      const query = String(call.args.query ?? '').toLowerCase();
      const data = (context.inventory ?? []).filter((item) =>
        item.name.toLowerCase().includes(query) || item.barcode.includes(query) || item.brand?.toLowerCase().includes(query),
      );
      console.info(LOG_PREFIX, 'Recherche produit locale terminée', { query, count: data.length });
      return { id: call.id, name: call.name, response: { success: true, data } };
    }

    return this.error(call, `Aucun handler fourni pour ${call.name}. L’application doit exécuter cette action.`);
  }

  private error(call: GeminiToolCall, error: string): GeminiToolResult {
    return { id: call.id, name: call.name, response: { success: false, error } };
  }
}
