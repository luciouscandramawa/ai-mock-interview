
import React, { useState, useEffect } from 'react';
import { getTeacherDashboardData } from '../services/geminiService';
import type { StudentSummary } from '../types';
import Spinner from './Spinner';

interface TeacherDashboardProps {
  onSelectStudent: (studentId: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ onSelectStudent }) => {
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
    <div className="container mx-auto animate-fadeIn">
       <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-semibold text-slate-800">Teacher Dashboard</h1>
        </div>
      <div className="bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Student Name</th>
                <th scope="col" className="px-6 py-4 font-semibold">Major</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Latest Score</th>
                <th scope="col" className="px-6 py-4 font-semibold text-center">Improvement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {students.map((student) => (
                <tr
                  key={student.id}
                  className="hover:bg-slate-50 cursor-pointer transition-colors"
                  onClick={() => onSelectStudent(student.id)}
                >
                  <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">{student.name}</td>
                  <td className="px-6 py-4">{student.major}</td>
                  <td className="px-6 py-4">
                    {student.completed ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-green-800 bg-green-100">Completed</span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-primary-text bg-primary-lightest">Pending</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-center font-mono text-slate-800">{student.latestScore}/100</td>
                  <td className={`px-6 py-4 text-center font-mono font-medium ${student.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
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
