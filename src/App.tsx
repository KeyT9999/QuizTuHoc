import { useState } from 'react';
import TextInput from './components/TextInput';
import Quiz from './components/Quiz';
import Result from './components/Result';
import type { Question } from './utils/quizParser';
import './App.css';

type AppScreen = 'input' | 'quiz' | 'result';

function App() {
  const [screen, setScreen] = useState<AppScreen>('input');
  const [questions, setQuestions] = useState<Question[]>([]);
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
    setQuestions([]);
    setAnswers({});
    setScreen('input');
  };

  const handleBackToInput = () => {
    setScreen('input');
  };

  return (
    <div className="app">
      {/* Animated background */}
      <div className="bg-decoration">
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
      </div>

      <main className="app-main">
        {screen === 'input' && <TextInput onStartQuiz={handleStartQuiz} />}
        {screen === 'quiz' && (
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

export default App;
