import { theme } from '@/lib/theme';

/**
 * Themes the browser-owned surfaces that react-native-web leaves at their
 * defaults: the focus ring, text selection, and the caret.
 *
 * The focus ring matters most. react-native-web sets `outline: none` on every
 * pressable, so without this a keyboard or switch user has no indication of
 * where they are on the page (WCAG 2.4.7). `:focus-visible` keeps the ring off
 * for pointer users, who do not need it.
 *
 * This runs as a side effect rather than living in `app/+html.tsx` because that
 * file only applies to static web output, and this app builds as a single-page
 * bundle. The native build resolves `browserSurfaces.ts` instead, which is a
 * no-op.
 */
const STYLE_ID = 'platewise-browser-surfaces';

const css = `
:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
    border-radius: 6px;
}

::selection {
    background-color: ${theme.colors.primarySoft};
    color: ${theme.colors.primaryDark};
}

input,
textarea {
    caret-color: ${theme.colors.primary};
}
`;

export function installBrowserSurfaces(): void {
    if (typeof document === 'undefined' || document.getElementById(STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = css;
    document.head.appendChild(style);
}
