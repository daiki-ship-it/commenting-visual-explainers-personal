import { renderToggle } from './toggle';
import { renderSidebar, toggleSidebar } from './sidebar';
import { renderPopup } from './popup';
import { renderNameDialog } from './name-dialog';

let _closePopup: (() => void) | null = null;
let _submitComment: (() => void) | null = null;

export function setRenderDeps(closePopup: () => void, submitComment: () => void): void {
  _closePopup = closePopup;
  _submitComment = submitComment;
}

export function render(): void {
  renderToggle(toggleSidebar);
  renderSidebar(render);
  renderPopup(render, _closePopup!, _submitComment!);
  renderNameDialog(render);
}

export { toggleSidebar };
