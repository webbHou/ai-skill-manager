import { BaseAdapter } from './base.js';
import { ClaudeAdapter } from './claude.js';
import { CopilotAdapter } from './copilot.js';
import { CursorAdapter } from './cursor.js';

export { BaseAdapter } from './base.js';
export { ClaudeAdapter } from './claude.js';
export { CopilotAdapter } from './copilot.js';
export { CursorAdapter } from './cursor.js';

export const adapters: Record<string, BaseAdapter> = {
  claude: new ClaudeAdapter(),
  copilot: new CopilotAdapter(),
  cursor: new CursorAdapter(),
};

export function getAdapter(platform: string): BaseAdapter | undefined {
  return adapters[platform.toLowerCase()];
}

export function getSupportedPlatforms(): string[] {
  return Object.keys(adapters);
}
