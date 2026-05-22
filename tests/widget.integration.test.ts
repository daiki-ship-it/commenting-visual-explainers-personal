import { describe, test, expect, beforeEach, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { USERNAME_KEY } from '../src/shared/constants';

const WIDGET_JS = readFileSync(
  resolve(__dirname, '../public/widget.js'),
  'utf-8'
);

function loadWidget() {
  document.head.innerHTML = '';
  document.body.innerHTML = '<p>テストテキスト</p>';

  const script = document.createElement('script');
  script.src = 'https://my-app.vercel.app/widget.js';
  script.dataset.token = 'test-token-abc';
  Object.defineProperty(document, 'currentScript', {
    value: script,
    writable: true,
    configurable: true,
  });

  window.localStorage.clear();

  vi.stubGlobal(
    'fetch',
    vi.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve([]),
        ok: true,
      })
    )
  );

  // eslint-disable-next-line no-eval
  eval(WIDGET_JS);
}

describe('widget.js 初期化', () => {
  beforeEach(() => {
    loadWidget();
  });

  test('トグルボタンが DOM に追加される', () => {
    const toggle = document.getElementById('fb-toggle');
    expect(toggle).toBeTruthy();
    expect(toggle!.tagName).toBe('BUTTON');
  });

  test('サイドバーが DOM に追加される', () => {
    const sidebar = document.getElementById('fb-sidebar');
    expect(sidebar).toBeTruthy();
  });

  test('スタイルが注入される', () => {
    const style = document.getElementById('fb-widget-styles');
    expect(style).toBeTruthy();
    expect(style!.tagName).toBe('STYLE');
  });

  test('CSS 変数が定義されている', () => {
    const style = document.getElementById('fb-widget-styles');
    const css = style!.textContent || '';
    expect(css).toContain('--fb-bg');
    expect(css).toContain('--fb-fg');
    expect(css).toContain('--fb-accent');
    expect(css).toContain('--fb-border');
    expect(css).toContain('--fb-muted');
    expect(css).toContain('--fb-primary');
    expect(css).toContain('--fb-destructive');
  });

  test('トグルボタンに「コメント」ラベルがある', () => {
    const toggle = document.getElementById('fb-toggle');
    expect(toggle!.innerHTML).toContain('コメント');
  });

  test('サイドバーにフィルタボタンがある', () => {
    const sidebar = document.getElementById('fb-sidebar');
    const html = sidebar!.innerHTML;
    expect(html).toContain('未返信');
    expect(html).toContain('返信済');
    expect(html).not.toContain('未解決');
    expect(html).not.toContain('すべて');
  });

  test('サイドバーにリサイズハンドルがある', () => {
    const sidebar = document.getElementById('fb-sidebar');
    const handle = sidebar!.querySelector('.fb-resize-handle');
    expect(handle).toBeTruthy();
  });

  test('サイドバーは初期状態で非表示（右にオフセット）', () => {
    const sidebar = document.getElementById('fb-sidebar') as HTMLElement;
    const right = parseInt(sidebar.style.right, 10);
    expect(right).toBeLessThan(0);
  });

  test('名前未入力時に名前入力ダイアログが表示される', () => {
    const overlay = document.getElementById('fb-name-overlay');
    expect(overlay).toBeTruthy();
    expect(overlay!.innerHTML).toContain('ようこそ');
  });
});

describe('widget.js ハイライト CSS', () => {
  beforeEach(() => {
    loadWidget();
  });

  test('ハイライトスタイルが定義されている', () => {
    const style = document.getElementById('fb-widget-styles');
    const css = style!.textContent || '';
    expect(css).toContain('.fb-highlight');
    expect(css).not.toContain('.fb-highlight-must');
  });

  test('カードスタイルが定義されている', () => {
    const style = document.getElementById('fb-widget-styles');
    const css = style!.textContent || '';
    expect(css).toContain('.fb-card');
    expect(css).toContain('.fb-card-head');
    expect(css).not.toContain('.fb-badge-p');
  });

  test('ポップアップスタイルが定義されている', () => {
    const style = document.getElementById('fb-widget-styles');
    const css = style!.textContent || '';
    expect(css).toContain('.fb-popup');
    expect(css).not.toContain('.fb-popup-pri');
    expect(css).toContain('.fb-popup-actions');
  });
});

describe('widget.js コメントなし状態', () => {
  beforeEach(() => {
    loadWidget();
  });

  test('コメントゼロ時にサイドバーに空状態メッセージが表示される', () => {
    const sidebar = document.getElementById('fb-sidebar');
    const html = sidebar!.innerHTML;
    expect(html).toContain('未返信のコメントはありません');
  });

  test('コメントゼロ時にバッジが表示されない', () => {
    const toggle = document.getElementById('fb-toggle');
    expect(toggle!.querySelector('.fb-badge')).toBeNull();
  });
});

describe('widget.js SVG アイコン', () => {
  beforeEach(() => {
    loadWidget();
  });

  test('トグルボタンに SVG アイコンが含まれる', () => {
    const toggle = document.getElementById('fb-toggle');
    expect(toggle!.innerHTML).toContain('<svg');
  });

  test('サイドバーの閉じるボタンに SVG アイコンが含まれる', () => {
    const sidebar = document.getElementById('fb-sidebar');
    const closeBtn = sidebar!.querySelector('[data-action="close"]');
    expect(closeBtn).toBeTruthy();
    expect(closeBtn!.innerHTML).toContain('<svg');
  });
});

function loadWidgetWithUser() {
  window.localStorage.setItem(USERNAME_KEY, 'テストユーザー');
  loadWidget();
}

function selectParagraphText() {
  const p = document.querySelector('p')!;
  const range = document.createRange();
  range.selectNodeContents(p);
  const sel = window.getSelection()!;
  sel.removeAllRanges();
  sel.addRange(range);
}

function dispatchMouse(
  type: 'mousedown' | 'mouseup',
  target: HTMLElement,
  buttons: number
) {
  target.dispatchEvent(
    new MouseEvent(type, {
      bubbles: true,
      cancelable: true,
      button: 0,
      buttons,
    })
  );
}

describe('widget.js テキスト選択とポップアップ', () => {
  beforeEach(() => {
    loadWidgetWithUser();
    Range.prototype.getBoundingClientRect = () =>
      ({
        top: 10,
        bottom: 30,
        left: 10,
        right: 100,
        width: 90,
        height: 20,
        x: 10,
        y: 10,
        toJSON: () => ({}),
      }) as DOMRect;
  });

  test('mousedown なしの mouseup ではポップアップを出さない', () => {
    selectParagraphText();
    const p = document.querySelector('p') as HTMLElement;
    dispatchMouse('mouseup', p, 0);
    const popup = document.getElementById('fb-popup');
    expect(popup?.classList.contains('show')).toBe(false);
  });

  test('ボタンを押したままの mouseup ではポップアップを出さない', () => {
    selectParagraphText();
    const p = document.querySelector('p') as HTMLElement;
    dispatchMouse('mousedown', p, 1);
    dispatchMouse('mouseup', p, 1);
    const popup = document.getElementById('fb-popup');
    expect(popup?.classList.contains('show')).toBe(false);
  });

  test('ビルド済み widget.js にボタン離し判定が含まれる', () => {
    expect(WIDGET_JS).toMatch(/buttons!==0|buttons!=0/);
    expect(WIDGET_JS).toMatch(/mousedown.*mouseup|mouseup.*mousedown/s);
  });
});
