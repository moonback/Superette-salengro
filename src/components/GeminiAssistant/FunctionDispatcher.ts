import type { AssistantExternalContext, GeminiToolCall, GeminiToolResult, ToolHandlers } from './types';
import { getToolDescription, isSensitiveTool, tools } from './tools';

export type PermissionAsker = (request: { toolName: string; args: Record<string, unknown>; description: string }) => Promise<boolean>;

export class FunctionDispatcher {
  constructor(
    private readonly handlers: ToolHandlers = {},
    private readonly askPermission: PermissionAsker,
    private readonly readContext: () => Promise<AssistantExternalContext>,
  ) {}

  async dispatch(call: GeminiToolCall): Promise<GeminiToolResult> {
    const tool = tools.find((candidate) => candidate.name === call.name);
    if (!tool) {
      return this.error(call, `Tool inconnu: ${call.name}`);
    }

    if (isSensitiveTool(call.name)) {
      const allowed = await this.askPermission({ toolName: call.name, args: call.args, description: getToolDescription(call.name) });
      if (!allowed) return { id: call.id, name: call.name, response: { success: false, denied: true, error: 'Action refusée par l’utilisateur' } };
    }

    const context = await this.readContext();
    const handler = this.handlers[tool.name];

    if (handler) {
      try {
        const data = await handler(call.args, context);
        return { id: call.id, name: call.name, response: { success: true, data } };
      } catch (err) {
        return this.error(call, err instanceof Error ? err.message : 'Erreur tool');
      }
    }

    return this.error(call, `Aucun handler fourni pour ${call.name}. L’application doit exécuter cette action.`);
  }

  private error(call: GeminiToolCall, error: string): GeminiToolResult {
    return { id: call.id, name: call.name, response: { success: false, error } };
  }
}
