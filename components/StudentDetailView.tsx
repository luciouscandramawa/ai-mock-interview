
import React, { useState, useEffect } from 'react';
import { getStudentDetails } from '../services/geminiService';
import type { StudentDetail } from '../types';
import Spinner from './Spinner';
import Card from './Card';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface StudentDetailViewProps {
  studentId: string;
  onBack: () => void;
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ studentId, onBack }) => {
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [teacherComment, setTeacherComment] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getStudentDetails(studentId);
      setStudent(data);
      setIsLoading(false);
    };
    fetchData();
  }, [studentId]);

  if (isLoading || !student) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto animate-fadeIn">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition-colors">
                <ArrowLeftIcon className="w-4 h-4"/>
                Back to Dashboard
            </button>
        </div>
      <div className="flex items-baseline justify-between mb-6">
        <div>
            <h1 className="text-3xl font-semibold text-slate-800">{student.name}</h1>
            <p className="text-lg text-primary">{student.major}</p>
        </div>
      </div>

      <Card>
        <h2 className="text-xl font-semibold mb-2 text-slate-800">AI Progress Summary</h2>
        <p className="text-slate-600 italic">"{student.progressSummary}"</p>
      </Card>

      {student.sessions && student.sessions.length > 0 && (
        <Card className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-slate-800">Session Scores Breakdown</h2>
            <div className="flex gap-4 overflow-x-auto p-2 justify-center">
            {student.sessions.map((session, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-shrink-0 w-16 text-center">
                <div className="w-8 h-40 bg-slate-200 rounded-full flex items-end relative" title={`Score: ${session.score.toFixed(1)}/10`}>
                    <div className="w-full bg-primary rounded-full transition-all duration-500" style={{ height: `${session.score * 10}%` }}></div>
                </div>
                <span className="text-xs text-slate-500">Q{index + 1}</span>
                <span className="text-sm font-bold text-slate-700">{session.score.toFixed(1)}</span>
                </div>
            ))}
            </div>
        </Card>
      )}
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4 text-slate-800">Latest Mock Interview Session</h2>
        <div className="space-y-6">
            {student.sessions.map((session, index) => (
                 <div key={index} className={`p-6 rounded-lg border ${session.isCorrect ? 'bg-green-50 border-green-200' : 'bg-primary-lightest border-primary-light'}`}>
                    <p className="font-semibold text-slate-700 mb-2">Question {index + 1}: {session.question}</p>
                    <div className="pl-4 border-l-2 border-slate-300">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm text-slate-500">Student's Answer:</p>
                            {session.isCorrect ? 
                                <span className="flex items-center text-xs text-green-800 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircleIcon className="w-3 h-3 mr-1"/> Good</span> : 
                                <span className="flex items-center text-xs text-primary-text bg-primary-lighter px-2 py-0.5 rounded-full"><XCircleIcon className="w-3 h-3 mr-1"/> Needs Work</span>
                            }
                        </div>
                        <p className="text-slate-800 italic mb-4">"{session.answer}"</p>
                        <div className="bg-slate-100 p-4 rounded-lg">
                            <h4 className="font-semibold text-primary mb-2">AI Feedback (Score: {session.score}/10)</h4>
                            <p className="text-sm text-slate-600">{session.evaluation}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
      </div>

       <div className="mt-8">
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-slate-800">Add Teacher Comment</h2>
          <textarea
            value={teacherComment}
            onChange={(e) => setTeacherComment(e.target.value)}
            placeholder="e.g., 'Excellent example, Minho. Next time, finish your answer by explaining what the experience taught you.'"
            className="w-full h-28 p-4 bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-primary-focus transition-colors"
          />
          <div className="flex justify-end mt-4">
             <button
                className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark disabled:bg-slate-400 focus:outline-none focus:ring-4 focus:ring-primary-focus/50 transition-all duration-300"
            >
                Save Comment
            </button>
          </div>
        </Card>
      </div>

    </div>
  );
};

export default StudentDetailView;
