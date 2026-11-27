export const STUDY_PROGRESS_UPDATED_EVENT = 'keyt-study-progress-updated';
export const PROGRESS_SYNCED_EVENT = 'keyt-progress-synced';

export interface StudyProgressUpdateDetail {
  resetSetIds?: string[];
  resetFlashcardIds?: string[];
  activityRecorded?: boolean;
}

let hydratingFromCloud = false;

export function setHydratingFromCloud(value: boolean): void {
  hydratingFromCloud = value;
}

export function isHydratingFromCloud(): boolean {
  return hydratingFromCloud;
}

export function notifyStudyProgressUpdated(detail?: StudyProgressUpdateDetail): void {
  if (hydratingFromCloud || typeof window === 'undefined') return;
  window.dispatchEvent(
    new CustomEvent<StudyProgressUpdateDetail>(STUDY_PROGRESS_UPDATED_EVENT, { detail })
  );
}
