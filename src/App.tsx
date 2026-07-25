import { useState } from 'react';
import TextInput from './components/TextInput';
import Quiz from './components/Quiz';
import Result from './components/Result';
import type { Question } from './utils/quizParser';
import { parseQuizText } from './utils/quizParser';
import { SAMPLE_QUIZ_TEXT } from './data/sampleQuiz';
import './App.css';

type AppScreen = 'input' | 'quiz' | 'result';

export default function App() {
  const defaultQuestions = parseQuizText(SAMPLE_QUIZ_TEXT);
  const [screen, setScreen] = useState<AppScreen>('quiz');
  const [questions, setQuestions] = useState<Question[]>(defaultQuestions);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const handleStartQuiz = (parsedQuestions: Question[]) => {
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

  const handleNewQuiz = () => {
    setScreen('input');
  };

  const handleBackToInput = () => {
    setScreen('input');
  };

  return (
    <div className="app">
      <main className="app-main">
        {screen === 'input' && <TextInput onStartQuiz={handleStartQuiz} />}
        {screen === 'quiz' && questions.length > 0 && (
          <Quiz
            questions={questions}
            onFinish={handleFinishQuiz}
            onBack={handleBackToInput}
          />
        )}
        {screen === 'result' && (
          <Result
            questions={questions}
            answers={answers}
            onRetry={handleRetry}
            onNewQuiz={handleNewQuiz}
          />
        )}
      </main>
    </div>
  );
}
