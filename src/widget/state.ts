import type { Priority, FilterMode } from '../shared/types';
import { USERNAME_KEY, SIDEBAR_WIDTH_KEY } from '../shared/constants';
import { slugify } from '../shared/slug';

export interface QuoteContext {
  beforeText: string;
  afterText: string;
}

export interface FbComment {
  id: string;
  author: string;
  type: string;
  quote: string;
  quoteContext: QuoteContext;
  content: string;
  priority: Priority;
  parentId: string | null;
  resolved: boolean;
  resolvedBy: string | null;
  resolvedAt: number | null;
  timestamp: number;
  updatedAt: number | null;
  pageUrl: string;
  projectSlug?: string;
}

export interface WidgetState {
  username: string;
  comments: FbComment[];
  filter: FilterMode;
  sidebarOpen: boolean;
  selectedText: string;
  selectedQuoteContext: QuoteContext;
  selectedRect: DOMRect | null;
  popupContent: string;
  editingId: string | null;
  editContent: string;
  editPriority: Priority;
  replyingTo: string | null;
  replyText: string;
  editingName: boolean;
  nameInput: string;
  popupPriority: Priority;
  sidebarWidth: number;
}

export const state: WidgetState = {
  username: localStorage.getItem(USERNAME_KEY) || '',
  comments: [],
  filter: 'unresolved',
  sidebarOpen: false,
  selectedText: '',
  selectedQuoteContext: { beforeText: '', afterText: '' },
  selectedRect: null,
  popupContent: '',
  editingId: null,
  editContent: '',
  editPriority: 'want',
  replyingTo: null,
  replyText: '',
  editingName: false,
  nameInput: '',
  popupPriority: 'must',
  sidebarWidth: parseInt(localStorage.getItem(SIDEBAR_WIDTH_KEY) || '', 10) || 400,
};

export const slug = slugify(window.location.href);
