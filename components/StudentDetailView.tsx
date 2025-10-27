
import React, { useState, useEffect } from 'react';
import { getStudentDetails } from '../services/geminiService';
import type { StudentDetail } from '../types';
import Spinner from './Spinner';
import Card from './Card';
import { ArrowLeftIcon, CheckCircleIcon, XCircleIcon } from './icons';

interface StudentDetailViewProps {
  studentId: string;
  onBack: () => void;
  onBackToWelcome: () => void;
}

const StudentDetailView: React.FC<StudentDetailViewProps> = ({ studentId, onBack, onBackToWelcome }) => {
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
    <div className="container mx-auto">
        <div className="flex items-center gap-4 mb-6">
            <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <ArrowLeftIcon className="w-5 h-5"/>
                Back to Dashboard
            </button>
            <button onClick={onBackToWelcome} className="text-sm text-gray-400 hover:text-white transition-colors">
                (Return to Student Portal)
            </button>
        </div>
      <div className="flex items-baseline justify-between mb-6">
        <div>
            <h1 className="text-3xl font-bold text-white">{student.name}</h1>
            <p className="text-lg text-violet-400">{student.major}</p>
        </div>
      </div>

      <Card>
        <h2 className="text-xl font-bold mb-2">AI Progress Summary</h2>
        <p className="text-gray-300 italic">"{student.progressSummary}"</p>
      </Card>

      {student.sessions && student.sessions.length > 0 && (
        <Card className="mt-8">
            <h2 className="text-xl font-bold mb-4">Session Scores Breakdown</h2>
            <div className="flex gap-4 overflow-x-auto p-2 justify-center">
            {student.sessions.map((session, index) => (
                <div key={index} className="flex flex-col items-center gap-2 flex-shrink-0 w-16 text-center">
                <div className="w-8 h-40 bg-[#2C2D3A] rounded-full flex items-end relative" title={`Score: ${session.score.toFixed(1)}/10`}>
                    <div className="w-full bg-violet-500 rounded-full transition-all duration-500" style={{ height: `${session.score * 10}%` }}></div>
                </div>
                <span className="text-xs text-gray-400">Q{index + 1}</span>
                <span className="text-sm font-bold">{session.score.toFixed(1)}</span>
                </div>
            ))}
            </div>
        </Card>
      )}
      
      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Latest Mock Interview Session</h2>
        <div className="space-y-6">
            {student.sessions.map((session, index) => (
                <Card key={index}>
                    <p className="font-semibold text-gray-300 mb-2">Question {index + 1}: {session.question}</p>
                    <div className="pl-4 border-l-2 border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm text-gray-400">Student's Answer:</p>
                            {session.isCorrect ? 
                                <span className="flex items-center text-xs text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full"><CheckCircleIcon className="w-3 h-3 mr-1"/> Good</span> : 
                                <span className="flex items-center text-xs text-yellow-400 bg-yellow-900/50 px-2 py-0.5 rounded-full"><XCircleIcon className="w-3 h-3 mr-1"/> Needs Work</span>
                            }
                        </div>
                        <p className="text-gray-200 italic mb-4">"{session.answer}"</p>
                        <div className="bg-[#2C2D3A]/70 p-4 rounded-lg">
                            <h4 className="font-semibold text-violet-300 mb-2">AI Feedback (Score: {session.score}/10)</h4>
                            <p className="text-sm text-gray-300">{session.evaluation}</p>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
      </div>

       <div className="mt-8">
        <Card>
          <h2 className="text-xl font-bold mb-4">Add Teacher Comment</h2>
          <textarea
            value={teacherComment}
            onChange={(e) => setTeacherComment(e.target.value)}
            placeholder="e.g., 'Excellent example, Minho. Next time, finish your answer by explaining what the experience taught you.'"
            className="w-full h-28 p-4 bg-[#2C2D3A] border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors"
          />
          <div className="flex justify-end mt-4">
             <button
                className="px-6 py-2 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 disabled:bg-gray-600 focus:outline-none focus:ring-4 focus:ring-violet-500/50 transition-all duration-300"
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
