#!/usr/bin/env bash
# Purpose: Purser 5.5, 2026-10-13. Confirm which VS Code identifiers porthole depends on
# exist at the claimed version floor (1.134.0), and when each first appears, by grepping the
# shallow clone's tags (1.130.0, 1.134.0, 1.141.0). Read-only; touches nothing in the clone
# beyond `git grep` against tag objects. Output feeds docs/VERSION-FLOOR.md.
#
# Usage: bash scripts/ephemeral/2026-10-13-version-floor-check.sh
set -uo pipefail
SRC="$HOME/Programming/_vscode-source/vscode"
TAGS=(1.130.0 1.134.0 1.141.0)

# label | fixed string | path prefix to search
CHECKS=(
  "_workbench.openWith command|_workbench.openWith|src/vs/workbench"
  "vscode.openWith command|vscode.openWith|src/vs/workbench"
  "browser editor id|workbench.editor.browser|src/vs/workbench/contrib/browserView"
  "AUX_WINDOW_GROUP = -3|AUX_WINDOW_GROUP = -3|src/vs/workbench/services/editor"
  "auxiliary option: compact|compact|src/vs/workbench/services/editor/common/editorGroupsService.ts"
  "auxiliary option: alwaysOnTop|alwaysOnTop|src/vs/workbench/services/editor/common/editorGroupsService.ts"
  "html association (browser)|'html', 'htm'|src/vs/workbench/contrib/browserView"
  "associatedResource|associatedResource|src/vs/workbench/contrib/browserView"
  "autoReloadOnFileChange setting|autoReloadOnFileChange|src/vs/workbench/contrib/browserView"
  "action restoreEditorsToMainWindow|workbench.action.restoreEditorsToMainWindow|src/vs/workbench"
  "action toggleWindowAlwaysOnTop|workbench.action.toggleWindowAlwaysOnTop|src/vs/workbench"
  "action enableWindowAlwaysOnTop|workbench.action.enableWindowAlwaysOnTop|src/vs/workbench"
  "action enableCompactAuxiliaryWindow|workbench.action.enableCompactAuxiliaryWindow|src/vs/workbench"
  "action moveEditorToNewWindow|workbench.action.moveEditorToNewWindow|src/vs/workbench"
  "action lockEditorGroup|workbench.action.lockEditorGroup|src/vs/workbench"
  "context key isAuxiliaryWindowFocusedContext|isAuxiliaryWindowFocusedContext|src/vs/workbench"
)

cd "$SRC" || exit 1
printf '%-42s' "identifier"; for t in "${TAGS[@]}"; do printf '%-12s' "$t"; done; echo
for row in "${CHECKS[@]}"; do
  IFS='|' read -r label needle path <<<"$row"
  printf '%-42s' "$label"
  for t in "${TAGS[@]}"; do
    n=$(git grep -F -c -e "$needle" "$t" -- "$path" 2>/dev/null | awk -F: '{s+=$NF} END{print s+0}')
    printf '%-12s' "$n"
  done
  echo
done
