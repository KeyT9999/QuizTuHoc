import { useState, useMemo } from 'react';
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
  loadCustomCourses,
  saveCustomCourses,
  loadCustomQuizSets,
  saveCustomQuizSets,
  deleteCustomCourse,
  deleteCustomQuizSet,
} from './utils/courseStorage';
import { useAppRouter } from './utils/router';
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
};

export default function App() {
  const { route, navigate } = useAppRouter();

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
        const key = `keyt_quiz_answers_${route.setId}`;
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
  const [knowledgeGroupId, setKnowledgeGroupId] = useState<string | null>(null);
  const [isKnowledgeGroupPickerOpen, setIsKnowledgeGroupPickerOpen] = useState(false);

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
    setAnswers({});
    setIsResultView(false);
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('result');
      window.history.replaceState({}, '', url.toString());
    } catch {
      // ignore
    }
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
    <div className="app">
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
            setTitle={knowledgeGroupId && knowledgeGroupConfig
              ? `${knowledgeGroupConfig.courseLabel} · Nhóm ${String(knowledgeGroupConfig.groups.find((group) => group.id === knowledgeGroupId)?.number ?? knowledgeGroupId).padStart(2, '0')}`
              : activeSet?.title}
            courseTitle={activeCourse?.name}
            courseCode={activeCourse?.code}
            setId={activeSet?.id}
          />
        )}

        {route.type === 'quiz' && !isResultView && knowledgeGroupConfig && isKnowledgeGroupPickerOpen && (
          <KnowledgeGroupPicker
            questions={parsedQuestions}
            groups={knowledgeGroupConfig.groups}
            getGroupId={knowledgeGroupConfig.getGroupId}
            courseLabel={knowledgeGroupConfig.courseLabel}
            onSelectGroup={(groupId) => {
              setKnowledgeGroupId(groupId);
              setAnswers({});
              setIsResultView(false);
              setIsKnowledgeGroupPickerOpen(false);
            }}
            onBack={() => setIsKnowledgeGroupPickerOpen(false)}
          />
        )}

        {/* 5. Màn hình làm bài trắc nghiệm văn bản (chuẩn PMG) */}
        {route.type === 'quiz' && !isResultView && activeSet && activeSet.kind !== 'image' && !isKnowledgeGroupPickerOpen && (
          <Quiz
            key={knowledgeGroupId ? `${activeSet.id}_group_${knowledgeGroupId}` : activeSet.id}
            setId={knowledgeGroupId ? `${activeSet.id}_group_${knowledgeGroupId}` : activeSet.id}
            setTitle={knowledgeGroupId && knowledgeGroupConfig
              ? `${knowledgeGroupConfig.courseLabel} · Nhóm ${String(knowledgeGroupConfig.groups.find((group) => group.id === knowledgeGroupId)?.number ?? knowledgeGroupId).padStart(2, '0')}`
              : activeSet.title}
            questions={knowledgeGroupConfig && knowledgeGroupId
              ? knowledgeGroupQuestions
              : parsedQuestions}
            onFinish={handleFinishQuiz}
            onBack={knowledgeGroupId
              ? () => setIsKnowledgeGroupPickerOpen(true)
              : handleBackToCourseDetail}
            onBackLabel={knowledgeGroupId ? '← Chọn nhóm' : undefined}
            onOpenKnowledgeGroups={knowledgeGroupConfig
              ? () => setIsKnowledgeGroupPickerOpen(true)
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
    </div>
  );
}
