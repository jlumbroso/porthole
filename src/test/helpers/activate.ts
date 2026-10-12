import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import type * as vscode from 'vscode';
import { resetState } from '../../commands';
import { activate } from '../../extension';
import { getRegisteredCommand, resetVscodeMock } from './vscodeMock';

export const MANIFEST = JSON.parse(readFileSync(resolve(__dirname, '../../../package.json'), 'utf8'));

/** Resets the mock and the extension's memory, then runs the real `activate`. */
export function activateFresh(): void {
  resetVscodeMock();
  resetState();
  const context = { subscriptions: [], extension: { packageJSON: MANIFEST } };
  activate(context as unknown as vscode.ExtensionContext);
}

/** The handler the extension really registered, wrapper included. */
export function command(id: string): (...args: unknown[]) => Promise<unknown> {
  const handler = getRegisteredCommand(id);
  if (!handler) { throw new Error(`command not registered: ${id}`); }
  return handler as (...args: unknown[]) => Promise<unknown>;
}
