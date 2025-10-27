
import React, { useState, useEffect } from 'react';
import { getTeacherDashboardData } from '../services/geminiService';
import type { StudentSummary } from '../types';
import Spinner from './Spinner';
import { ArrowLeftIcon } from './icons';

interface TeacherDashboardProps {
  onSelectStudent: (studentId: string) => void;
  onBackToWelcome: () => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onSelectStudent, onBackToWelcome }) => {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const data = await getTeacherDashboardData();
      setStudents(data);
      setIsLoading(false);
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto">
       <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-white">Teacher Dashboard</h1>
            <button 
                onClick={onBackToWelcome} 
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 bg-gray-700/50 rounded-md hover:bg-gray-600/50 transition-colors"
            >
                <ArrowLeftIcon className="w-4 h-4"/>
                Student Portal
            </button>
        </div>
      <div className="bg-[#1E1F2A] border border-gray-700/50 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-gray-300">
            <thead className="text-xs text-gray-400 uppercase bg-[#2C2D3A]">
              <tr>
                <th scope="col" className="px-6 py-3">Student Name</th>
                <th scope="col" className="px-6 py-3">Major</th>
                <th scope="col" className="px-6 py-3">Status</th>
                <th scope="col" className="px-6 py-3 text-center">Latest Score</th>
                <th scope="col" className="px-6 py-3 text-center">Improvement</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="bg-[#1E1F2A] border-b border-gray-700/50 hover:bg-[#2C2D3A] cursor-pointer transition-colors"
                  onClick={() => onSelectStudent(student.id)}
                >
                  <td className="px-6 py-4 font-medium text-white whitespace-nowrap">{student.name}</td>
                  <td className="px-6 py-4">{student.major}</td>
                  <td className="px-6 py-4">
                    {student.completed ? (
                      <span className="px-2 py-1 text-xs font-medium text-green-300 bg-green-900/50 rounded-full">Completed</span>
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium text-yellow-300 bg-yellow-900/50 rounded-full">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-mono">{student.latestScore}/100</td>
                  <td className={`px-6 py-4 text-center font-mono ${student.improvement >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {student.improvement >= 0 ? `+${student.improvement}%` : `${student.improvement}%`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;
