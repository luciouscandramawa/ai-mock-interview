import React, { useState, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import InterviewSession from './components/InterviewSession';
import ResultsScreen from './components/ResultsScreen';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDetailView from './components/StudentDetailView';
import { InterviewReport, Question, Answer } from './types';
import { generateQuestions, evaluateAnswers, saveInterviewReportForStudent } from './services/geminiService';

type View = 'welcome' | 'session' | 'results' | 'teacherDashboard' | 'studentDetail';

const App: React.FC = () => {
  const [view, setView] = useState<View>('welcome');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStartInterview = useCallback(async (input: string | { data: string; mimeType: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedQuestions = await generateQuestions(input);
      setQuestions(generatedQuestions);
      setView('session');
    } catch (err) {
      setError('Failed to generate questions. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleFinishInterview = useCallback(async (answers: Answer[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const interviewReport = await evaluateAnswers(questions, answers);
      // In a real app, you'd have a logged-in user. Here we simulate
      // updating student '3' (Seo-jun Lee) who is marked as 'Pending'.
      saveInterviewReportForStudent('3', interviewReport);
      setReport(interviewReport);
      setView('results');
    } catch (err)
     {
      setError('Failed to evaluate answers. Please try again.');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [questions]);

  const handleTryAnotherTopic = () => {
    setQuestions([]);
    setReport(null);
    setView('welcome');
  };
  
  const handleBackToWelcome = () => {
    setView('welcome');
  };

  const handleViewStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    setView('studentDetail');
  };

  const handleBackToDashboard = () => {
    setSelectedStudentId(null);
    setView('teacherDashboard');
  };

  const renderView = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center h-screen text-white">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-violet-400"></div>
          <p className="mt-4 text-lg">AI is working its magic...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-screen text-white">
            <div className="bg-red-900/50 border border-red-500 p-6 rounded-lg text-center">
                <h2 className="text-xl font-bold mb-2 text-red-300">An Error Occurred</h2>
                <p className="text-red-200">{error}</p>
                <button 
                    onClick={() => {
                      setError(null);
                      setView('welcome');
                    }} 
                    className="mt-4 px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-md transition-colors"
                >
                    Back to Start
                </button>
            </div>
        </div>
       );
    }


    switch (view) {
      case 'session':
        return <InterviewSession questions={questions} onFinish={handleFinishInterview} />;
      case 'results':
        return report && <ResultsScreen report={report} onRetry={handleTryAnotherTopic} />;
      case 'teacherDashboard':
        return <TeacherDashboard onSelectStudent={handleViewStudent} onBackToWelcome={handleBackToWelcome} />;
      case 'studentDetail':
        return selectedStudentId && <StudentDetailView studentId={selectedStudentId} onBack={handleBackToDashboard} onBackToWelcome={handleBackToWelcome} />;
      case 'welcome':
      default:
        return (
            <div>
                 <nav className="absolute top-0 left-0 right-0 p-4 flex justify-end">
                    <button
                        onClick={() => setView('teacherDashboard')}
                        className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition-colors"
                    >
                        Teacher View
                    </button>
                </nav>
                <WelcomeScreen onStart={handleStartInterview} />
            </div>
        );
    }
  };

  return (
    <main className="min-h-screen bg-[#10111A] text-gray-200 font-sans p-4 sm:p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {renderView()}
      </div>
    </main>
  );
};

export default App;
