import type { Course } from '../data/courses';
import type { QuizSetInfo } from '../data/quizSets';
import type { FlashcardSet } from '../data/flashcardData';
import { parseQuizText } from './quizParser';

const STORAGE_CUSTOM_COURSES = 'keyt_custom_courses';
const STORAGE_CUSTOM_QUIZZES = 'keyt_custom_quiz_sets';

export function loadCustomCourses(): Course[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_COURSES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi khi đọc danh sách môn học tự tạo:', err);
    return [];
  }
}

export function saveCustomCourses(courses: Course[]): void {
  try {
    localStorage.setItem(STORAGE_CUSTOM_COURSES, JSON.stringify(courses));
  } catch (err) {
    console.error('Lỗi khi lưu danh sách môn học tự tạo:', err);
  }
}

export function loadCustomQuizSets(): QuizSetInfo[] {
  try {
    const raw = localStorage.getItem(STORAGE_CUSTOM_QUIZZES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Lỗi khi đọc danh sách bộ đề tự tạo:', err);
    return [];
  }
}

export function saveCustomQuizSets(sets: QuizSetInfo[]): void {
  try {
    localStorage.setItem(STORAGE_CUSTOM_QUIZZES, JSON.stringify(sets));
  } catch (err) {
    console.error('Lỗi khi lưu danh sách bộ đề tự tạo:', err);
  }
}

export function deleteCustomCourse(courseId: string): void {
  const currentCourses = loadCustomCourses();
  const filteredCourses = currentCourses.filter((c) => c.id !== courseId);
  saveCustomCourses(filteredCourses);

  const currentSets = loadCustomQuizSets();
  const filteredSets = currentSets.filter((s) => s.courseId !== courseId);
  saveCustomQuizSets(filteredSets);
}

export function deleteCustomQuizSet(setId: string): void {
  const currentSets = loadCustomQuizSets();
  const filteredSets = currentSets.filter((s) => s.id !== setId);
  saveCustomQuizSets(filteredSets);

  try {
    localStorage.removeItem(`keyt_quiz_mastered_${setId}`);
    localStorage.removeItem(`keyt_image_quiz_mastered_${setId}`);
  } catch (err) {
    console.error('Lỗi khi xóa tiến độ bộ đề:', err);
  }
}

export function getQuizSetProgress(set: QuizSetInfo): { total: number; mastered: number; percent: number } {
  const total = set.kind === 'image' ? (set.imageCount ?? 0) : parseQuizText(set.rawText).length;
  if (total === 0) return { total: 0, mastered: 0, percent: 0 };

  try {
    const storageKey = set.kind === 'image'
      ? `keyt_image_quiz_mastered_${set.id}`
      : `keyt_quiz_mastered_${set.id}`;
    const savedMastered = localStorage.getItem(storageKey);
    let masteredIds: number[] = [];
    if (savedMastered) {
      masteredIds = JSON.parse(savedMastered);
    } else if (set.id === 'cchn_426' || set.id === 'ccnc_426') {
      const legacyMastered = localStorage.getItem('keyt_quiz_mastered');
      if (legacyMastered) masteredIds = JSON.parse(legacyMastered);
    }
    const mastered = masteredIds.length;
    const percent = Math.round((mastered / total) * 100);
    return { total, mastered, percent };
  } catch {
    return { total, mastered: 0, percent: 0 };
  }
}

export function calculateCourseProgress(
  courseId: string,
  sets: QuizSetInfo[]
): { totalSets: number; totalQuestions: number; masteredQuestions: number; percent: number } {
  const courseSets = sets.filter((s) => s.courseId === courseId);
  let totalQuestions = 0;
  let masteredQuestions = 0;

  for (const set of courseSets) {
    const prog = getQuizSetProgress(set);
    totalQuestions += prog.total;
    masteredQuestions += prog.mastered;
  }

  const percent = totalQuestions > 0 ? Math.round((masteredQuestions / totalQuestions) * 100) : 0;
  return {
    totalSets: courseSets.length,
    totalQuestions,
    masteredQuestions,
    percent,
  };
}

export function getFlashcardProgress(fcSet: FlashcardSet): { total: number; known: number; percent: number } {
  const total = fcSet.cards.length;
  try {
    const saved = localStorage.getItem(`keyt_flashcard_known_${fcSet.id}`);
    const knownIds: number[] = saved ? JSON.parse(saved) : [];
    const known = knownIds.length;
    const percent = total > 0 ? Math.round((known / total) * 100) : 0;
    return { total, known, percent };
  } catch {
    return { total, known: 0, percent: 0 };
  }
}
