import * as vscode from 'vscode';

export interface Size {
  name: string;
  width: number;
  height: number;
}

export interface Position {
  x: number;
  y: number;
}

/** The first preset is the one Spike 0 was run and approved at (ADR-0003). */
export const DEFAULT_SIZES: readonly Size[] = [
  { name: 'S', width: 420, height: 640 },
  { name: 'M', width: 480, height: 720 },
  { name: 'L', width: 640, height: 900 },
];

const cfg = () => vscode.workspace.getConfiguration('porthole');

const isCount = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value > 0;

/**
 * The size presets from settings. An entry without a usable width and height is
 * dropped; if none survive, the defaults apply. Values are not clamped here:
 * VS Code already raises anything below 400×270 (source check, note 2).
 */
export function sizes(): Size[] {
  const raw = cfg().get<unknown>('sizes');
  const valid: Size[] = [];
  if (Array.isArray(raw)) {
    for (const entry of raw) {
      if (entry && typeof entry === 'object' && isCount(entry.width) && isCount(entry.height)) {
        const name = typeof entry.name === 'string' && entry.name ? entry.name : `${entry.width}×${entry.height}`;
        valid.push({ name, width: entry.width, height: entry.height });
      }
    }
  }
  return valid.length > 0 ? valid : [...DEFAULT_SIZES];
}

export function position(): Position | undefined {
  const raw = cfg().get<unknown>('position');
  if (raw && typeof raw === 'object') {
    const { x, y } = raw as Record<string, unknown>;
    if (typeof x === 'number' && Number.isFinite(x) && typeof y === 'number' && Number.isFinite(y)) {
      return { x, y };
    }
  }
  return undefined;
}

export const compact = (): boolean => cfg().get<boolean>('compact', true);
export const alwaysOnTop = (): boolean => cfg().get<boolean>('alwaysOnTop', true);
export const useInternalCommand = (): boolean => cfg().get<boolean>('useInternalCommand', true);
