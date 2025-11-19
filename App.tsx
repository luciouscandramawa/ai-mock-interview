
import React, { useState, useCallback } from 'react';
import WelcomeScreen from './components/WelcomeScreen';
import InterviewSession from './components/InterviewSession';
import ResultsScreen from './components/ResultsScreen';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDetailView from './components/StudentDetailView';
import { InterviewReport, Question, Answer } from './types';
import { generateQuestions, evaluateAnswers, saveInterviewReportForStudent } from './services/geminiService';

type View = 'welcome' | 'session' | 'results' | 'teacherDashboard' | 'studentDetail';

const AdminHeader: React.FC = () => (
  <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm my-6 flex items-center justify-between animate-fadeIn">
    <div className="flex items-center gap-4">
      <span className="text-3xl" role="img" aria-label="Teacher">👩‍🏫</span>
      <div>
        <h2 className="font-bold text-slate-800">관리자가 할 수 있는 일</h2>
        <p className="text-sm text-slate-600">조직을 위한 커리큘럼을 만들고 사용자를 초대하세요!</p>
      </div>
    </div>
  </div>
);

const App: React.FC = () => {
  const [view, setView] = useState<View>('welcome');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [report, setReport] = useState<InterviewReport | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModeToggle = (isAdmin: boolean) => {
    setIsAdminMode(isAdmin);
    if (isAdmin) {
      setView('teacherDashboard');
    } else {
      setView('welcome');
      setQuestions([]);
      setReport(null);
    }
  };

  const handleStartInterview = useCallback(async (input: string | { data: string; mimeType: string }) => {
    setIsLoading(true);
    setError(null);
    try {
      const generatedQuestions = await generateQuestions(input);
      setQuestions(generatedQuestions);
      setView('session');
    } catch (err) {
      setError('질문 생성에 실패했습니다. 다시 시도해주세요.');
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
      saveInterviewReportForStudent('3', interviewReport);
      setReport(interviewReport);
      setView('results');
    } catch (err)
     {
      setError('답변 평가에 실패했습니다. 다시 시도해주세요.');
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
        <div className="flex flex-col items-center justify-center h-screen text-slate-700">
          <div className="w-16 h-16 border-4 border-dashed rounded-full animate-spin border-primary"></div>
          <p className="mt-4 text-lg">AI가 작업 중입니다...</p>
        </div>
      );
    }

    if (error) {
       return (
        <div className="flex flex-col items-center justify-center h-screen text-slate-700">
            <div className="bg-red-100 border border-red-400 p-6 rounded-lg text-center shadow-lg">
                <h2 className="text-xl font-bold mb-2 text-red-800">오류가 발생했습니다</h2>
                <p className="text-red-700">{error}</p>
                <button 
                    onClick={() => {
                      setError(null);
                      handleModeToggle(false);
                    }} 
                    className="mt-4 px-4 py-2 bg-primary text-white hover:bg-primary-dark rounded-md transition-colors"
                >
                    처음으로 돌아가기
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
        return <TeacherDashboard onSelectStudent={handleViewStudent} />;
      case 'studentDetail':
        return selectedStudentId && <StudentDetailView studentId={selectedStudentId} onBack={handleBackToDashboard} />;
      case 'welcome':
      default:
        return <WelcomeScreen onStart={handleStartInterview} />;
    }
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-700 font-sans">
      <div className="flex justify-center pt-6">
        <div className="bg-slate-100 p-1 rounded-lg shadow-inner flex items-center border border-slate-200">
          <button
            onClick={() => handleModeToggle(false)}
            className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
              !isAdminMode
                ? 'bg-white text-primary-text shadow-sm'
                : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            학생 모드
          </button>
          <button
            onClick={() => handleModeToggle(true)}
            className={`px-5 py-2 text-sm font-semibold rounded-md transition-all duration-300 ${
              isAdminMode
                ? 'bg-white text-primary-text shadow-sm'
                : 'text-slate-500 hover:bg-slate-200'
            }`}
          >
            교사 모드
          </button>
        </div>
      </div>
      <div className="max-w-5xl mx-auto p-4 sm:p-6 lg:px-8">
        {isAdminMode && <AdminHeader />}
        {renderView()}
      </div>
    </main>
  );
};

export default App;
