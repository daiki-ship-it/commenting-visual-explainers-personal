/**
 * Icons: Lucide (https://lucide.dev)
 * ISC License - Copyright (c) Lucide Contributors 2026
 */

// document.currentScript は IIFE 先頭でキャプチャ必須（esbuild の import 巻き上げ前に実行される）
const SCRIPT = document.currentScript as HTMLScriptElement | null;
const API_BASE = SCRIPT ? SCRIPT.src.replace(/\/widget\.js.*$/, '') : '';
const API_TOKEN = SCRIPT ? (SCRIPT.dataset.token || '') : '';

import type { Priority } from '../shared/types';
import { USERNAME_KEY, PRIORITY_CYCLE } from '../shared/constants';
import { generateId } from '../shared/slug';
import { initApi, api } from './api';
import { state, slug, type FbComment } from './state';
import { injectStyles } from './styles';
import { render, toggleSidebar, setRenderDeps } from './render/index';
import { setSidebarActions } from './render/sidebar';
import { applyHighlights } from './highlight';
import { scrollToQuote, scrollToCard } from './scroll';
import { setupTextSelection } from './selection';

initApi(API_BASE, API_TOKEN);

function loadComments(): Promise<void> {
  return api('GET', { slug }).then((c) => {
    if (Array.isArray(c)) state.comments = c;
    render();
    applyHighlights(onClickHighlight);
  }).catch(() => {
    render();
    applyHighlights(onClickHighlight);
  });
}

function closePopup(): void {
  state.selectedText = '';
  state.selectedRect = null;
  state.popupContent = '';
  state.popupPriority = 'must';
  render();
}

function submitComment(priority: Priority): void {
  if (!state.username || !state.selectedText) return;
  const c: FbComment = {
    id: generateId(), author: state.username, type: 'comment',
    quote: state.selectedText, quoteContext: state.selectedQuoteContext,
    content: state.popupContent.trim(),
    priority, parentId: null, pageUrl: window.location.href,
    projectSlug: slug, timestamp: Date.now(),
    resolved: false, resolvedBy: null, resolvedAt: null, updatedAt: null,
  };
  state.comments.push(c);
  closePopup();
  applyHighlights(onClickHighlight);
  api('POST', c as unknown as Record<string, unknown>).then(loadComments);
}

function resolveComment(id: string): void {
  const c = state.comments.find((x) => x.id === id);
  if (!c) return;
  const now = !c.resolved;
  c.resolved = now;
  c.resolvedBy = now ? state.username : null;
  c.resolvedAt = now ? Date.now() : null;
  render(); applyHighlights(onClickHighlight);
  api('PUT', { id, action: 'resolve', resolved: now, resolvedBy: c.resolvedBy, resolvedAt: c.resolvedAt });
}

function cyclePriority(id: string): void {
  const c = state.comments.find((x) => x.id === id);
  if (!c || c.author !== state.username) return;
  c.priority = PRIORITY_CYCLE[c.priority] || 'must';
  render(); applyHighlights(onClickHighlight);
  api('PUT', { id, action: 'cyclePriority', priority: c.priority });
}

function deleteComment(id: string): void {
  state.comments = state.comments.filter((c) => c.id !== id && c.parentId !== id);
  render(); applyHighlights(onClickHighlight);
  api('DELETE', { id });
}

function deleteReply(id: string): void {
  state.comments = state.comments.filter((c) => c.id !== id);
  render();
  api('DELETE', { id });
}

function saveEdit(id: string): void {
  const c = state.comments.find((x) => x.id === id);
  if (!c) return;
  c.content = state.editContent;
  c.priority = state.editPriority;
  state.editingId = null;
  render(); applyHighlights(onClickHighlight);
  api('PUT', { id, action: 'edit', content: c.content, priority: c.priority });
}

function submitReply(parentId: string): void {
  if (!state.replyText.trim() || !state.username) return;
  const r: FbComment = {
    id: generateId(), author: state.username, type: 'comment',
    quote: '', quoteContext: { beforeText: '', afterText: '' },
    content: state.replyText.trim(), priority: 'want',
    parentId, pageUrl: window.location.href,
    projectSlug: slug, timestamp: Date.now(),
    resolved: false, resolvedBy: null, resolvedAt: null, updatedAt: null,
  };
  state.comments.push(r);
  state.replyingTo = null;
  state.replyText = '';
  render();
  api('POST', r as unknown as Record<string, unknown>);
}

function finishNameEdit(): void {
  if (state.nameInput.trim() && state.nameInput.trim() !== state.username) {
    const oldName = state.username;
    state.username = state.nameInput.trim();
    localStorage.setItem(USERNAME_KEY, state.username);
    api('PUT', { id: '_rename', action: 'rename', author: state.username, oldAuthor: oldName, projectSlug: slug }).then(loadComments);
  }
  state.editingName = false;
  render();
}

function onClickHighlight(id: string): void {
  scrollToCard(id, toggleSidebar);
}

// Wire up dependencies before first render
setRenderDeps(closePopup, submitComment);
setSidebarActions({
  toggleSidebar,
  cyclePriority,
  scrollToQuote,
  resolveComment,
  deleteComment,
  deleteReply,
  saveEdit,
  submitReply,
  finishNameEdit,
});

function init(): void {
  injectStyles();
  render();
  setupTextSelection(render, closePopup);
  loadComments();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
