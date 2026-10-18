import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type * as vscode from 'vscode';
import { resetState } from '../../commands';
import { activate } from '../../extension';
import { getRegisteredCommand, resetVscodeMock, Uri } from './vscodeMock';

export const MANIFEST = JSON.parse(readFileSync(resolve(__dirname, '../../../package.json'), 'utf8'));

let workspaceState = new Map<string, unknown>();
const memento = {
  get: (key: string, fallback?: unknown) => (workspaceState.has(key) ? workspaceState.get(key) : fallback),
  update: async (key: string, value: unknown) => { workspaceState.set(key, value); },
  keys: () => [...workspaceState.keys()],
};

/** Resets the mock and the extension's memory, then runs the real `activate`. */
export function activateFresh(): void {
  resetVscodeMock();
  workspaceState = new Map();
  activateAgain();
}

/**
 * What Reload Window does to Porthole: a fresh copy of the extension, with the
 * workspace's saved state and the windows VS Code restored (whatever the test
 * left open) still there.
 */
export function activateAgain(): void {
  resetState();
  const context = { subscriptions: [], extension: { packageJSON: MANIFEST }, extensionUri: Uri.file('/ext'), workspaceState: memento };
  activate(context as unknown as vscode.ExtensionContext);
}

/** The handler the extension really registered, wrapper included. */
export function command(id: string): (...args: unknown[]) => Promise<unknown> {
  const handler = getRegisteredCommand(id);
  if (!handler) { throw new Error(`command not registered: ${id}`); }
  return handler as (...args: unknown[]) => Promise<unknown>;
}
