import { useState, useMemo, useEffect } from 'react';
import CourseSelector from './components/CourseSelector';
import CourseQuizList from './components/CourseQuizList';
import CreateCourseModal from './components/CreateCourseModal';
import TextInput from './components/TextInput';
import Quiz from './components/Quiz';
import ImageQuiz from './components/ImageQuiz';
import Result from './components/Result';
import Flashcard from './components/Flashcard';
import KnowledgeGroupPicker from './components/KnowledgeGroupPicker';
import type { Question } from './utils/quizParser';
import { parseQuizText } from './utils/quizParser';
import { DEFAULT_COURSES, type Course } from './data/courses';
import { DEFAULT_QUIZ_SETS, type QuizSetInfo } from './data/quizSets';
import { FLASHCARD_SETS, type FlashcardSet } from './data/flashcardData';
import { MLN_RESEARCH_ANSWER_KEYS } from './data/mlnResearchAnswerKeys';
import {
  getMln111KnowledgeGroupId,
  getMln111QuestionsForGroup,
  MLN111_KNOWLEDGE_GROUPS,
} from './data/mln111KnowledgeGroups';
import {
  getMln122KnowledgeGroupId,
  getMln122QuestionsForGroup,
  MLN122_KNOWLEDGE_GROUPS,
} from './data/mln122KnowledgeGroups';
import {
  getHcm202KnowledgeGroupId,
  getHcm202QuestionsForGroup,
  HCM202_KNOWLEDGE_GROUPS,
} from './data/hcm202KnowledgeGroups';
import {
  getMkt209mKnowledgeGroupId,
  getMkt209mQuestionsForGroup,
  MKT209M_KNOWLEDGE_GROUPS,
} from './data/mkt209mKnowledgeGroups';
import {
  getMkt301KnowledgeGroupId,
  getMkt301QuestionsForGroup,
  MKT301_KNOWLEDGE_GROUPS,
} from './data/mkt301KnowledgeGroups';
import {
  getCcm301KnowledgeGroupId,
  getCcm301QuestionsForGroup,
  CCM301_KNOWLEDGE_GROUPS,
} from './data/ccm301KnowledgeGroups';
import {
  getBra301KnowledgeGroupId,
  getBra301QuestionsForGroup,
  BRA301_KNOWLEDGE_GROUPS,
} from './data/bra301KnowledgeGroups';
import {
  getEvn301KnowledgeGroupId,
  getEvn301QuestionsForGroup,
  EVN301_KNOWLEDGE_GROUPS,
} from './data/evn301KnowledgeGroups';
import {
  getMco302KnowledgeGroupId,
  getMco302QuestionsForGroup,
  MCO302_KNOWLEDGE_GROUPS,
} from './data/mco302KnowledgeGroups';
import {
  loadCustomCourses,
  saveCustomCourses,
  loadCustomQuizSets,
  saveCustomQuizSets,
  deleteCustomCourse,
  deleteCustomQuizSet,
} from './utils/courseStorage';
import { useAppRouter } from './utils/router';
import { clearQuizAttemptStorage } from './utils/quizSplit';
import WoodenFish from './components/WoodenFish';
import ThemeAmbientCanvas from './components/ThemeAmbientCanvas';
import { useTheme } from './context/ThemeContext';
import './App.css';

interface KnowledgeGroupConfig {
  courseLabel: string;
  groups: Array<{ id: string; number: number; title: string; summary: string }>;
  getGroupId: (question: Question) => string;
  filterQuestions: (questions: Question[], groupId: string) => Question[];
}

const KNOWLEDGE_GROUP_CONFIGS: Partial<Record<string, KnowledgeGroupConfig>> = {
  mln111_full: {
    courseLabel: 'MLN111',
    groups: MLN111_KNOWLEDGE_GROUPS,
    getGroupId: getMln111KnowledgeGroupId,
    filterQuestions: getMln111QuestionsForGroup,
  },
  mln122_full: {
    courseLabel: 'MLN122',
    groups: MLN122_KNOWLEDGE_GROUPS,
    getGroupId: getMln122KnowledgeGroupId,
    filterQuestions: getMln122QuestionsForGroup,
  },
  hcm292_fullsrc: {
    courseLabel: 'HCM202',
    groups: HCM202_KNOWLEDGE_GROUPS,
    getGroupId: getHcm202KnowledgeGroupId,
    filterQuestions: getHcm202QuestionsForGroup,
  },
  hcm202_bakhi: {
    courseLabel: 'HCM202',
    groups: HCM202_KNOWLEDGE_GROUPS,
    getGroupId: getHcm202KnowledgeGroupId,
    filterQuestions: getHcm202QuestionsForGroup,
  },
  mkt209m_full: {
    courseLabel: 'MKT209M',
    groups: MKT209M_KNOWLEDGE_GROUPS,
    getGroupId: getMkt209mKnowledgeGroupId,
    filterQuestions: getMkt209mQuestionsForGroup,
  },
  mkt301_full: {
    courseLabel: 'MKT301',
    groups: MKT301_KNOWLEDGE_GROUPS,
    getGroupId: getMkt301KnowledgeGroupId,
    filterQuestions: getMkt301QuestionsForGroup,
  },
  ccm301_hoc_bao_pass: {
    courseLabel: 'CCM301',
    groups: CCM301_KNOWLEDGE_GROUPS,
    getGroupId: getCcm301KnowledgeGroupId,
    filterQuestions: getCcm301QuestionsForGroup,
  },
  bra301_quiz_ba_khi: {
    courseLabel: 'BRA301',
    groups: BRA301_KNOWLEDGE_GROUPS,
    getGroupId: getBra301KnowledgeGroupId,
    filterQuestions: getBra301QuestionsForGroup,
  },
  evn301_quiz_ba_khi: {
    courseLabel: 'EVN301',
    groups: EVN301_KNOWLEDGE_GROUPS,
    getGroupId: getEvn301KnowledgeGroupId,
    filterQuestions: getEvn301QuestionsForGroup,
  },
  mco302_quiz_ba_khi: {
    courseLabel: 'MCO302',
    groups: MCO302_KNOWLEDGE_GROUPS,
    getGroupId: getMco302KnowledgeGroupId,
    filterQuestions: getMco302QuestionsForGroup,
  },
};

function getKnowledgeGroupIdFromUrl(setId: string): string | null {
  const groupId = new URLSearchParams(window.location.search).get('group');
  if (!groupId) return null;

  const config = KNOWLEDGE_GROUP_CONFIGS[setId];
  return config?.groups.some((group) => group.id === groupId) ? groupId : null;
}

function isKnowledgeGroupPickerRequestedFromUrl(setId: string): boolean {
  return Boolean(KNOWLEDGE_GROUP_CONFIGS[setId])
    && new URLSearchParams(window.location.search).get('groupPicker') === 'true';
}

function updateKnowledgeGroupUrlState(
  groupId: string | null,
  pickerOpen: boolean,
  clearResult = false
): void {
  try {
    const url = new URL(window.location.href);
    if (groupId) url.searchParams.set('group', groupId);
    else url.searchParams.delete('group');

    if (pickerOpen) url.searchParams.set('groupPicker', 'true');
    else url.searchParams.delete('groupPicker');
    if (clearResult) url.searchParams.delete('result');

    window.history.replaceState({}, '', url.toString());
  } catch {
    // Keep the current screen state if the browser rejects the URL update.
  }
}

export default function App() {
  const { route, navigate } = useAppRouter();
  const { theme } = useTheme();

  const [courses, setCourses] = useState<Course[]>(() => [
    ...DEFAULT_COURSES,
    ...loadCustomCourses(),
  ]);
  const [isCreateCourseOpen, setIsCreateCourseOpen] = useState(false);

  const [quizSets, setQuizSets] = useState<QuizSetInfo[]>(() => [
    ...DEFAULT_QUIZ_SETS,
    ...loadCustomQuizSets(),
  ]);

  const [currentFlashcardSet, setCurrentFlashcardSet] = useState<FlashcardSet>(FLASHCARD_SETS[0]);
  const [answers, setAnswers] = useState<Record<number, string>>(() => {
    try {
      const search = new URLSearchParams(window.location.search);
      if (search.get('result') === 'true' && route.type === 'quiz') {
        const groupId = getKnowledgeGroupIdFromUrl(route.setId);
        const setKey = groupId ? `${route.setId}_group_${groupId}` : route.setId;
        const key = `keyt_quiz_answers_${setKey}`;
        const raw = localStorage.getItem(key);
        if (raw) return JSON.parse(raw);
      }
    } catch {
      // ignore
    }
    return {};
  });
  const [isResultView, setIsResultView] = useState<boolean>(() => {
    try {
      return new URLSearchParams(window.location.search).get('result') === 'true';
    } catch {
      return false;
    }
  });
  const [knowledgeGroupId, setKnowledgeGroupId] = useState<string | null>(() =>
    route.type === 'quiz' ? getKnowledgeGroupIdFromUrl(route.setId) : null
  );
  const [isKnowledgeGroupPickerOpen, setIsKnowledgeGroupPickerOpen] = useState<boolean>(() =>
    route.type === 'quiz' && isKnowledgeGroupPickerRequestedFromUrl(route.setId)
  );
  const [quizAttemptNonce, setQuizAttemptNonce] = useState<number>(0);

  // Derive active course and quiz set from current route
  const activeCourse = useMemo(() => {
    if ('courseId' in route) {
      return courses.find((c) => c.id === route.courseId) || null;
    }
    return null;
  }, [route, courses]);

  const activeSet = useMemo(() => {
    if (route.type === 'quiz') {
      return quizSets.find((s) => s.id === route.setId) || null;
    }
    return null;
  }, [route, quizSets]);

  const knowledgeGroupConfig = activeSet
    ? KNOWLEDGE_GROUP_CONFIGS[activeSet.id]
    : undefined;

  const effectiveQuizSetId = useMemo(() => {
    const baseSetId = activeSet?.id ?? (route.type === 'quiz' ? route.setId : undefined);
    if (!baseSetId) return undefined;
    const groupConfig = KNOWLEDGE_GROUP_CONFIGS[baseSetId];
    const resolvedGroupId = knowledgeGroupId ?? getKnowledgeGroupIdFromUrl(baseSetId);
    return resolvedGroupId && groupConfig
      ? `${baseSetId}_group_${resolvedGroupId}`
      : baseSetId;
  }, [activeSet, knowledgeGroupId, route]);

  useEffect(() => {
    const nextGroupId = route.type === 'quiz' && activeSet
      ? getKnowledgeGroupIdFromUrl(activeSet.id)
      : null;
    const shouldOpenPicker = route.type === 'quiz' && activeSet
      ? isKnowledgeGroupPickerRequestedFromUrl(activeSet.id)
      : false;
    setKnowledgeGroupId(nextGroupId);
    setIsKnowledgeGroupPickerOpen(shouldOpenPicker);
  }, [activeSet, route]);

  const parsedQuestions = useMemo(() => {
    if (activeSet && activeSet.kind !== 'image') {
      const parsed = parseQuizText(activeSet.rawText);
      const researchedAnswers = MLN_RESEARCH_ANSWER_KEYS[activeSet.id];

      if (!researchedAnswers) return parsed;

      return parsed.map((question, index) => {
        const researchedAnswer = researchedAnswers[index];
        return researchedAnswer && researchedAnswer !== '?'
          ? { ...question, correctAnswer: researchedAnswer }
          : question;
      });
    }
    return [];
  }, [activeSet]);

  const knowledgeGroupQuestions = useMemo(() => {
    if (!knowledgeGroupId || !knowledgeGroupConfig) return parsedQuestions;
    return knowledgeGroupConfig.filterQuestions(parsedQuestions, knowledgeGroupId);
  }, [knowledgeGroupConfig, knowledgeGroupId, parsedQuestions]);

  const openKnowledgeGroupPicker = () => {
    updateKnowledgeGroupUrlState(knowledgeGroupId, true);
    setIsKnowledgeGroupPickerOpen(true);
  };

  const closeKnowledgeGroupPicker = () => {
    updateKnowledgeGroupUrlState(knowledgeGroupId, false);
    setIsKnowledgeGroupPickerOpen(false);
  };

  const handleChooseAnotherKnowledgeGroup = () => {
    updateKnowledgeGroupUrlState(null, true, true);
    setKnowledgeGroupId(null);
    setAnswers({});
    setIsResultView(false);
    setIsKnowledgeGroupPickerOpen(true);
  };

  // Điều hướng chọn môn học
  const handleSelectCourse = (course: Course) => {
    if (course.id === 'flashcard') {
      navigate('/flashcards');
      return;
    }
    navigate(`/course/${course.id}`);
  };

  // Tạo môn học mới
  const handleCreateCourse = (newCourse: Course) => {
    const updatedCourses = [...courses, newCourse];
    setCourses(updatedCourses);
    saveCustomCourses(updatedCourses.filter((c) => c.isCustom));
    // Mở ngay môn học mới tạo
    navigate(`/course/${newCourse.id}`);
  };

  // Xóa môn học tự tạo
  const handleDeleteCourse = (courseId: string) => {
    deleteCustomCourse(courseId);
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
    setQuizSets((prev) => prev.filter((s) => s.courseId !== courseId));
    if (activeCourse?.id === courseId) {
      navigate('/courses');
    }
  };

  // Chọn một đề thi để làm bài
  const handleSelectSet = (setInfo: QuizSetInfo) => {
    const courseId = setInfo.courseId || activeCourse?.id || 'pmg201c';
    setIsResultView(false);
    setAnswers({});
    setKnowledgeGroupId(null);
    setIsKnowledgeGroupPickerOpen(false);
    navigate(`/course/${courseId}/${setInfo.id}`);
  };

  // Xóa đề thi tự tạo
  const handleDeleteQuizSet = (setId: string) => {
    deleteCustomQuizSet(setId);
    setQuizSets((prev) => prev.filter((s) => s.id !== setId));
    if (route.type === 'quiz' && route.setId === setId) {
      navigate(`/course/${route.courseId}`);
    }
  };

  // Chọn bộ thẻ flashcard
  const handleSelectFlashcard = (fcSet: FlashcardSet) => {
    setCurrentFlashcardSet(fcSet);
    navigate('/flashcards');
  };

  // Mở màn hình dán / nhập đề thi mới
  const handleCreateNewSet = () => {
    const courseId = activeCourse?.id || 'pmg201c';
    navigate(`/course/${courseId}/new-quiz`);
  };

  // Bắt đầu làm bài từ đề tự nhập
  const handleStartCustomQuiz = (
    _parsed: Question[],
    title: string = 'Bộ đề tự nhập',
    rawText: string = '',
    courseId?: string
  ) => {
    const targetCourseId = courseId || activeCourse?.id || 'pmg201c';
    const newSetId = `custom_${Date.now()}`;
    const newSet: QuizSetInfo = {
      id: newSetId,
      courseId: targetCourseId,
      title,
      description: `Bộ đề tự dán (${_parsed.length} câu)`,
      category: activeCourse ? `Môn ${activeCourse.code}` : 'Bộ đề tự tạo',
      badge: `${_parsed.length} câu`,
      rawText: rawText,
    };

    const updatedCustom = [...loadCustomQuizSets(), newSet];
    saveCustomQuizSets(updatedCustom);
    setQuizSets((prev) => [...prev, newSet]);

    setIsResultView(false);
    setAnswers({});
    navigate(`/course/${targetCourseId}/${newSetId}`);
  };

  const handleFinishQuiz = (userAnswers: Record<number, string>) => {
    setAnswers(userAnswers);
    setIsResultView(true);
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('result', 'true');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
  };

  const handleRetry = () => {
    const baseSetId = activeSet?.id ?? (route.type === 'quiz' ? route.setId : undefined);
    const activeGroupId =
      knowledgeGroupId ?? (baseSetId ? getKnowledgeGroupIdFromUrl(baseSetId) : null);
    const targetSetId = baseSetId
      ? activeGroupId && KNOWLEDGE_GROUP_CONFIGS[baseSetId]
        ? `${baseSetId}_group_${activeGroupId}`
        : baseSetId
      : undefined;

    clearQuizAttemptStorage(targetSetId);

    if (activeGroupId && knowledgeGroupId !== activeGroupId) {
      setKnowledgeGroupId(activeGroupId);
    }
    setIsKnowledgeGroupPickerOpen(false);
    setAnswers({});
    setIsResultView(false);
    setQuizAttemptNonce((prev) => prev + 1);

    try {
      const url = new URL(window.location.href);
      if (activeGroupId) {
        url.searchParams.set('group', activeGroupId);
      }
      url.searchParams.delete('groupPicker');
      url.searchParams.delete('result');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Điều hướng quay lại danh sách môn học
  const handleBackToCourseList = () => {
    navigate('/courses');
  };

  // Điều hướng quay lại danh sách đề thi của môn
  const handleBackToCourseDetail = () => {
    setIsResultView(false);
    setKnowledgeGroupId(null);
    setIsKnowledgeGroupPickerOpen(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('result');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
    if (activeCourse) {
      navigate(`/course/${activeCourse.id}`);
    } else {
      navigate('/courses');
    }
  };

  return (
    <div className="app" data-theme={theme}>
      <main className="app-main">
        {/* 1. Màn hình danh sách môn học */}
        {route.type === 'course_list' && (
          <CourseSelector
            courses={courses}
            quizSets={quizSets}
            flashcardSets={FLASHCARD_SETS}
            onSelectCourse={handleSelectCourse}
            onSelectFlashcard={handleSelectFlashcard}
            onCreateCourseClick={() => setIsCreateCourseOpen(true)}
            onDeleteCourse={handleDeleteCourse}
          />
        )}

        {/* 2. Màn hình danh sách đề thi của môn */}
        {route.type === 'course_detail' && (
          activeCourse ? (
            <CourseQuizList
              course={activeCourse}
              quizSets={quizSets}
              onSelectSet={handleSelectSet}
              onBack={handleBackToCourseList}
              onCreateQuizSet={handleCreateNewSet}
              onDeleteQuizSet={handleDeleteQuizSet}
            />
          ) : (
            <div className="app-error-state">
              <h3>Không tìm thấy môn học</h3>
              <p>Môn học này không tồn tại hoặc đã bị xóa.</p>
              <button className="back-btn" onClick={handleBackToCourseList}>
                ← Quay lại danh sách môn học
              </button>
            </div>
          )
        )}

        {/* 3. Màn hình tạo / dán đề mới cho môn */}
        {route.type === 'new_quiz' && (
          <TextInput
            targetCourse={activeCourse}
            onStartQuiz={handleStartCustomQuiz}
            onBack={handleBackToCourseDetail}
          />
        )}

        {/* 4. Màn hình kết quả làm bài */}
        {route.type === 'quiz' && isResultView && (
          <Result
            questions={knowledgeGroupQuestions}
            answers={answers}
            onRetry={handleRetry}
            onNewQuiz={handleBackToCourseDetail}
            onChooseAnotherKnowledgeGroup={knowledgeGroupId && knowledgeGroupConfig
              ? handleChooseAnotherKnowledgeGroup
              : undefined}
            setTitle={knowledgeGroupId && knowledgeGroupConfig
              ? `${knowledgeGroupConfig.courseLabel} · Nhóm ${String(knowledgeGroupConfig.groups.find((group) => group.id === knowledgeGroupId)?.number ?? knowledgeGroupId).padStart(2, '0')}`
              : activeSet?.title}
            courseTitle={activeCourse?.name}
            courseCode={activeCourse?.code}
            setId={effectiveQuizSetId}
          />
        )}

        {route.type === 'quiz' && !isResultView && knowledgeGroupConfig && isKnowledgeGroupPickerOpen && (
          <KnowledgeGroupPicker
            setId={activeSet?.id ?? route.setId}
            questions={parsedQuestions}
            groups={knowledgeGroupConfig.groups}
            getGroupId={knowledgeGroupConfig.getGroupId}
            courseLabel={knowledgeGroupConfig.courseLabel}
            onSelectGroup={(groupId) => {
              setKnowledgeGroupId(groupId);
              updateKnowledgeGroupUrlState(groupId, false);
              setAnswers({});
              setIsResultView(false);
              setIsKnowledgeGroupPickerOpen(false);
            }}
            onBack={closeKnowledgeGroupPicker}
          />
        )}

        {/* 5. Màn hình làm bài trắc nghiệm văn bản (chuẩn PMG) */}
        {route.type === 'quiz' && !isResultView && activeSet && activeSet.kind !== 'image' && !isKnowledgeGroupPickerOpen && (
          <Quiz
            key={`${effectiveQuizSetId ?? activeSet.id}_${quizAttemptNonce}`}
            setId={effectiveQuizSetId ?? activeSet.id}
            setTitle={knowledgeGroupId && knowledgeGroupConfig
              ? `${knowledgeGroupConfig.courseLabel} · Nhóm ${String(knowledgeGroupConfig.groups.find((group) => group.id === knowledgeGroupId)?.number ?? knowledgeGroupId).padStart(2, '0')}`
              : activeSet.title}
            questions={knowledgeGroupConfig && knowledgeGroupId
              ? knowledgeGroupQuestions
              : parsedQuestions}
            onFinish={handleFinishQuiz}
            onBack={knowledgeGroupId
              ? openKnowledgeGroupPicker
              : handleBackToCourseDetail}
            onBackLabel={knowledgeGroupId ? '← Chọn nhóm' : undefined}
            onOpenKnowledgeGroups={knowledgeGroupConfig
              ? openKnowledgeGroupPicker
              : undefined}
            knowledgeGroupsLabel={knowledgeGroupId ? 'Đổi nhóm' : undefined}
          />
        )}

        {/* 6. Màn hình làm bài đề ảnh (nếu có) */}
        {route.type === 'quiz' && !isResultView && activeSet && activeSet.kind === 'image' && (
          <ImageQuiz
            setId={activeSet.id}
            setTitle={activeSet.title}
            imageBasePath={activeSet.imageBasePath ?? ''}
            imageCount={activeSet.imageCount ?? 0}
            imageExtension={activeSet.imageExtension ?? 'webp'}
            onComplete={handleBackToCourseDetail}
            onBack={handleBackToCourseDetail}
          />
        )}

        {/* 7. Lỗi không tìm thấy đề */}
        {route.type === 'quiz' && !activeSet && (
          <div className="app-error-state">
            <h3>Không tìm thấy đề thi</h3>
            <p>Bộ đề này không tồn tại hoặc đường dẫn không chính xác.</p>
            <button className="back-btn" onClick={handleBackToCourseDetail}>
              ← Quay lại danh sách đề thi
            </button>
          </div>
        )}

        {/* 8. Màn hình Flashcard */}
        {route.type === 'flashcard' && (
          <Flashcard
            flashcardSet={currentFlashcardSet}
            onBack={handleBackToCourseList}
          />
        )}
      </main>

      {/* Modal tạo môn học mới */}
      <CreateCourseModal
        isOpen={isCreateCourseOpen}
        onClose={() => setIsCreateCourseOpen(false)}
        onCreateCourse={handleCreateCourse}
      />

      {/* Ambient WebGL / Interactive Particle & Cursor Layer */}
      <ThemeAmbientCanvas theme={theme} />

      {/* Widget Gõ Mõ Tịnh Tâm & Cầu May */}
      <WoodenFish />
    </div>
  );
}
