/**
 * Native no-op. The web build resolves `browserSurfaces.web.ts`, which themes
 * the browser-owned focus ring, selection, and caret. iOS and Android draw
 * those surfaces themselves, so there is nothing to install here.
 */
export function installBrowserSurfaces(): void {
    // Intentionally empty.
}
