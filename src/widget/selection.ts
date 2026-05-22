import { state, type QuoteContext } from './state';

const FB_UI = '#fb-sidebar,#fb-toggle,#fb-popup';

function isFbUi(target: EventTarget | null): boolean {
  return !!(target as HTMLElement)?.closest?.(FB_UI);
}

export function getQuoteContext(range: Range): QuoteContext {
  let before = '', after = '';
  try {
    const br = document.createRange();
    br.setStart(document.body, 0);
    br.setEnd(range.startContainer, range.startOffset);
    before = br.toString().slice(-50).replace(/[\s\u00A0]+/g, ' ').trim();
    const ar = document.createRange();
    ar.setStart(range.endContainer, range.endOffset);
    ar.setEnd(document.body, document.body.childNodes.length);
    after = ar.toString().slice(0, 50).replace(/[\s\u00A0]+/g, ' ').trim();
  } catch (_) { /* ignore */ }
  return { beforeText: before, afterText: after };
}

export function setupTextSelection(onRender: () => void, closePopup: () => void): void {
  let pointerDown = false;

  document.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return;
    if (isFbUi(e.target)) return;
    pointerDown = true;
    if (state.selectedRect) closePopup();
  });

  document.addEventListener('mouseup', (e) => {
    if (e.button !== 0) return;
    if (!pointerDown) return;
    pointerDown = false;
    if (e.buttons !== 0) return;
    if (isFbUi(e.target)) return;

    const sel = window.getSelection();
    const text = sel?.toString().trim();
    if (!text || !sel || sel.rangeCount === 0 || !state.username) return;
    const range = sel.getRangeAt(0);
    state.selectedText = text.replace(/[\s\u00A0]+/g, ' ').substring(0, 200);
    state.selectedRect = range.getBoundingClientRect();
    state.selectedQuoteContext = getQuoteContext(range);
    state.popupContent = '';
    onRender();
  });
}
