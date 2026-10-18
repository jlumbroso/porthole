import * as vscode from 'vscode';
import { cycleSize, dockBack, markdownFilesShown, openRequested, pageShownIn, popOut, togglePin, trackWindows } from './commands';
import { guardFloatingWindows } from './keepToOneTab';
import { handleLink } from './outsideLinks';
import { initMarkdownColors } from './markdownColors';
import { reviewSettings } from './settingsReview';
import { describeError, initLog, log } from './log';

type Handler = (...args: unknown[]) => Promise<unknown>;

/**
 * Every command goes through this wrapper: async, awaited, logged, rethrown.
 * A bare arrow that calls an async function without awaiting it turns failures
 * into invisible unhandled rejections (ADR-0002, adopted practice 1).
 */
function register(context: vscode.ExtensionContext, id: string, handler: Handler): void {
  context.subscriptions.push(vscode.commands.registerCommand(id, async (...args: unknown[]) => {
    try {
      return await handler(...args);
    } catch (err) {
      log(`${id} failed: ${describeError(err)}`);
      throw err;
    }
  }));
}

export function activate(context: vscode.ExtensionContext): void {
  context.subscriptions.push(initLog(), trackWindows(), initMarkdownColors(context.extensionUri, markdownFilesShown), guardFloatingWindows(pageShownIn));
  // A stale install and a changed VS Code are the two things worth seeing first.
  log(`Porthole ${context.extension.packageJSON.version} activated on ${vscode.env.appName} ${vscode.version}`);

  register(context, 'porthole.popOut', popOut);
  register(context, 'porthole.cycleSize', cycleSize);
  register(context, 'porthole.dockBack', dockBack);
  register(context, 'porthole.togglePin', togglePin);
  register(context, 'porthole.reviewSettings', reviewSettings);

  // vscode://jlumbroso.porthole/v1/open?file=… (ADR-0013). Failures are logged, as for commands.
  context.subscriptions.push(vscode.window.registerUriHandler({
    handleUri: async uri => {
      try {
        await handleLink(uri, openRequested);
      } catch (err) {
        log(`outside link failed: ${describeError(err)}`);
      }
    },
  }));
}

export function deactivate(): void {}
