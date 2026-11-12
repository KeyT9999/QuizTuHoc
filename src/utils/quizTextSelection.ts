import type { MouseEvent } from 'react';

export function isModifiedQuizKey(event: Partial<Pick<KeyboardEvent,
  'ctrlKey' | 'metaKey' | 'altKey' | 'shiftKey' | 'isComposing'
>>): boolean {
  return Boolean(event.ctrlKey || event.metaKey || event.altKey || event.shiftKey || event.isComposing);
}

// Browsers also emit click after dragging across text inside an answer button.
// Ignore that click, but retain native keyboard/assistive-technology activation.
export function isAnswerTextSelection(event: Pick<MouseEvent<HTMLElement>, 'detail' | 'currentTarget'>): boolean {
  if (event.detail === 0) return false;
  const selection = event.currentTarget.ownerDocument.getSelection();
  return Boolean(selection && !selection.isCollapsed && selection.rangeCount > 0
    && selection.getRangeAt(0).intersectsNode(event.currentTarget));
}
