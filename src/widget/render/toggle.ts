import { topLevelComments, hasReplies } from '../comments';
import { el } from '../dom';
import { icon } from '../icons';
import { state } from '../state';

export function renderToggle(toggleSidebar: () => void): void {
  let btn = document.getElementById('fb-toggle');
  if (!btn) {
    btn = el('button', { id: 'fb-toggle', onClick: toggleSidebar });
    document.body.appendChild(btn);
  }
  const unrepliedCount = topLevelComments(state.comments).filter(
    (c) => !hasReplies(state.comments, c.id)
  ).length;
  let h = '<span class="fb-toggle-icon">' + icon('panelRight', 16);
  if (unrepliedCount > 0) h += '<span class="fb-badge">' + unrepliedCount + '</span>';
  h += '</span>';
  h += '<span class="fb-toggle-label">コメント</span>';
  btn.innerHTML = h;
  btn.style.display = state.sidebarOpen ? 'none' : '';
}
