import type { FbComment } from './state';

export function topLevelComments(comments: FbComment[]): FbComment[] {
  return comments.filter((c) => !c.parentId);
}

export function hasReplies(comments: FbComment[], commentId: string): boolean {
  return comments.some((c) => c.parentId === commentId);
}
