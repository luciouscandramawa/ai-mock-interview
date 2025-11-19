
import React, { useState, useEffect } from 'react';
import { getTeacherDashboardData } from '../services/geminiService';
import type { StudentSummary, User } from '../types';
import Spinner from './Spinner';
import Card from './Card';

interface TeacherDashboardProps {
  currentUser: User;
  onSelectStudent: (studentId: string) => void;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ currentUser, onSelectStudent }) => {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const allStudents = await getTeacherDashboardData();
      
      // Filter students based on teacher's school AND Grade
      const myStudents = allStudents.filter(s => {
          if (s.schoolId !== currentUser.schoolId) return false;
          // If teacher has a grade assigned, filter by it
          if (currentUser.grade && s.grade !== currentUser.grade) return false;
          return true;
      });

      setStudents(myStudents);
      setIsLoading(false);
    };
    if (currentUser.schoolId) {
        fetchData();
    }
  }, [currentUser]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="container mx-auto animate-fadeIn">
       <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-6 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-800">교사 대시보드</h1>
                <p className="text-slate-500 mt-1 font-medium">
                    {currentUser.schoolName} {currentUser.grade ? `• ${currentUser.grade}학년` : ''}
                </p>
            </div>
            <div className="text-sm font-bold bg-white px-4 py-2 rounded-lg border border-slate-200 shadow-sm">
                총 학생 수: <span className="text-primary text-lg">{students.length}</span>명
            </div>
        </div>

      {students.length === 0 ? (
          <Card className="text-center py-12">
              <p className="text-slate-500 text-lg">등록된 학생이 없습니다.</p>
              <p className="text-sm text-slate-400 mt-2">학교와 학년 정보를 확인해주세요.</p>
          </Card>
      ) : (
        <div className="bg-white border border-slate-200 rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
            <table className="min-w-full text-sm text-left text-slate-600">
                <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                    <th scope="col" className="px-6 py-4 font-bold">학생 이름</th>
                    <th scope="col" className="px-6 py-4 font-bold">학년/반</th>
                    <th scope="col" className="px-6 py-4 font-bold">전공 (참고)</th>
                    <th scope="col" className="px-6 py-4 font-bold">상태</th>
                    <th scope="col" className="px-6 py-4 font-bold text-center">최근 점수</th>
                    <th scope="col" className="px-6 py-4 font-bold text-center">성취도 변화</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                {students.map((student) => (
                    <tr
                    key={student.id}
                    className="hover:bg-slate-50 cursor-pointer transition-colors"
                    onClick={() => onSelectStudent(student.id)}
                    >
                    <td className="px-6 py-4 font-medium text-slate-800 whitespace-nowrap">
                        {student.name}
                    </td>
                    <td className="px-6 py-4">
                        {student.grade}학년 {student.classNumber}반
                    </td>
                    <td className="px-6 py-4">{student.major}</td>
                    <td className="px-6 py-4">
                        {student.completed ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-green-800 bg-green-100">완료됨</span>
                        ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold text-slate-600 bg-slate-100">대기중</span>
                        )}
                    </td>
                    <td className="px-6 py-4 text-center font-mono text-slate-800 font-bold">{student.latestScore}/100</td>
                    <td className={`px-6 py-4 text-center font-mono font-bold ${student.improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {student.improvement >= 0 ? `▲ ${student.improvement}%` : `▼ ${Math.abs(student.improvement)}%`}
                    </td>
                    </tr>
                ))}
                </tbody>
            </table>
            </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
