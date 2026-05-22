import { state } from './state';

const FLASH_COLOR = 'rgba(59,130,246,0.4)';

export function scrollToQuote(id: string): void {
  const mark = document.querySelector('.fb-highlight[data-comment-id="' + id + '"]') as HTMLElement | null;
  if (!mark) return;
  mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const orig = mark.style.backgroundColor;
  mark.style.backgroundColor = FLASH_COLOR;
  mark.style.transition = 'background-color 0.3s';
  setTimeout(() => { mark.style.backgroundColor = orig; }, 1500);
}

export function scrollToCard(id: string, toggleSidebar: () => void): void {
  const wasClosed = !state.sidebarOpen;
  if (wasClosed) { toggleSidebar(); }
  setTimeout(() => {
    const card = document.querySelector('.fb-card[data-id="' + id + '"]') as HTMLElement | null;
    if (!card) return;
    card.scrollIntoView({ behavior: 'smooth', block: 'center' });
    card.classList.add('fb-focused');
    setTimeout(() => { card.classList.remove('fb-focused'); }, 1500);
  }, wasClosed ? 350 : 0);
}
