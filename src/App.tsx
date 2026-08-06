import { useState } from 'react';
import QuizSetSelector from './components/QuizSetSelector';
import TextInput from './components/TextInput';
import Quiz from './components/Quiz';
import ImageQuiz from './components/ImageQuiz';
import Result from './components/Result';
import type { Question } from './utils/quizParser';
import { parseQuizText } from './utils/quizParser';
import { DEFAULT_QUIZ_SETS, type QuizSetInfo } from './data/quizSets';
import './App.css';

type AppScreen = 'quiz_list' | 'input' | 'quiz' | 'result';

export default function App() {
  const [screen, setScreen] = useState<AppScreen>('quiz_list');
  const [quizSets, setQuizSets] = useState<QuizSetInfo[]>(DEFAULT_QUIZ_SETS);
  const [currentSet, setCurrentSet] = useState<QuizSetInfo | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleSelectSet = (setInfo: QuizSetInfo) => {
    if (setInfo.kind === 'image') {
      setCurrentSet(setInfo);
      setQuestions([]);
      setAnswers({});
      setScreen('quiz');
      return;
    }

    const parsed = parseQuizText(setInfo.rawText);
    setCurrentSet(setInfo);
    setQuestions(parsed);
    setAnswers({});
    setScreen('quiz');
  };

  const handleCreateNewSet = () => {
    setScreen('input');
  };

  const handleStartCustomQuiz = (
    parsedQuestions: Question[],
    title: string = 'Bộ đề tự nhập',
    rawText: string = ''
  ) => {
    const newSet: QuizSetInfo = {
      id: `custom_${Date.now()}`,
      title,
      description: `Bộ đề tự dán (${parsedQuestions.length} câu)`,
      category: 'Bộ đề tự tạo',
      badge: `${parsedQuestions.length} câu`,
      rawText: rawText,
    };
    setQuizSets((prev) => [...prev, newSet]);
    setCurrentSet(newSet);
    setQuestions(parsedQuestions);
    setAnswers({});
    setScreen('quiz');
  };

  const handleFinishQuiz = (userAnswers: Record<number, string>) => {
    setAnswers(userAnswers);
    setScreen('result');
  };

  const handleRetry = () => {
    setAnswers({});
    setScreen('quiz');
  };

  const handleBackToQuizList = () => {
    setScreen('quiz_list');
  };

  return (
    <div className="app">
      <main className="app-main">
        {screen === 'quiz_list' && (
          <QuizSetSelector
            quizSets={quizSets}
            onSelectSet={handleSelectSet}
            onCreateNewSet={handleCreateNewSet}
          />
        )}
        {screen === 'input' && (
          <TextInput
            onStartQuiz={handleStartCustomQuiz}
            onBack={handleBackToQuizList}
          />
        )}
        {screen === 'quiz' && questions.length > 0 && (
          <Quiz
            setId={currentSet?.id}
            setTitle={currentSet?.title}
            questions={questions}
            onFinish={handleFinishQuiz}
            onBack={handleBackToQuizList}
          />
        )}
        {screen === 'quiz' && currentSet?.kind === 'image' && (
          <ImageQuiz
            setId={currentSet.id}
            setTitle={currentSet.title}
            imageBasePath={currentSet.imageBasePath ?? ''}
            imageCount={currentSet.imageCount ?? 0}
            imageExtension={currentSet.imageExtension ?? 'webp'}
            onComplete={handleBackToQuizList}
            onBack={handleBackToQuizList}
          />
        )}
        {screen === 'result' && (
          <Result
            questions={questions}
            answers={answers}
            onRetry={handleRetry}
            onNewQuiz={handleBackToQuizList}
          />
        )}
      </main>
    </div>
  );
}
