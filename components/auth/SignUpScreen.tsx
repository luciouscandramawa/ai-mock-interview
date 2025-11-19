
import React, { useState, useEffect } from 'react';
import AuthLayout from './AuthLayout';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { MailIcon, LockIcon, UserIcon, GraduationCapIcon, BrainIcon } from '../icons';
import { getSchools, signUp } from '../../services/authService';
import { School, User } from '../../types';

interface SignUpScreenProps {
  onSignUp: (user: User) => void;
  onSwitchToSignIn: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onSwitchToSignIn }) => {
  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Organization State
  const [schools, setSchools] = useState<School[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState('');
  const [selectedGrade, setSelectedGrade] = useState<number | ''>('');
  const [selectedClassNumber, setSelectedClassNumber] = useState<number | ''>('');

  const [isLoading, setIsLoading] = useState(false);

  // Load schools on mount
  useEffect(() => {
    getSchools().then(setSchools);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }
    if (!selectedSchoolId) {
        alert("학교를 선택해주세요.");
        return;
    }
    if (!selectedGrade) {
        alert("학년을 선택해주세요.");
        return;
    }
    if (role === 'student' && !selectedClassNumber) {
        alert("반을 입력해주세요.");
        return;
    }

    setIsLoading(true);
    try {
        const user = await signUp(
            name, 
            email, 
            role, 
            selectedSchoolId, 
            Number(selectedGrade), 
            role === 'student' ? Number(selectedClassNumber) : undefined
        );
        onSignUp(user);
    } catch (error) {
        console.error(error);
        alert("회원가입 중 오류가 발생했습니다.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuthLayout 
      title="회원가입" 
      subtitle="학교와 학년을 선택하여 맞춤형 서비스를 이용하세요."
    >
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
        <button
            type="button"
            onClick={() => setRole('student')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${role === 'student' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <GraduationCapIcon className="w-4 h-4" />
            학생용
        </button>
        <button
            type="button"
            onClick={() => setRole('teacher')}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${role === 'teacher' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
        >
            <BrainIcon className="w-4 h-4" />
            교사용
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="이름"
          type="text"
          placeholder="홍길동"
          value={name}
          onChange={(e) => setName(e.target.value)}
          icon={<UserIcon className="w-5 h-5" />}
          required
        />
        
        <div className="space-y-4">
             <Select
                label="학교 선택"
                options={schools.map(s => ({ value: s.id, label: s.name }))}
                value={selectedSchoolId}
                onChange={(e) => setSelectedSchoolId(e.target.value)}
                required
            />
            
            <div className="grid grid-cols-2 gap-4">
                <Select
                    label="학년 선택"
                    options={[
                        { value: 1, label: '1학년' },
                        { value: 2, label: '2학년' },
                        { value: 3, label: '3학년' }
                    ]}
                    value={selectedGrade}
                    onChange={(e) => setSelectedGrade(Number(e.target.value))}
                    required
                />
                {role === 'student' && (
                     <Input
                        label="반 입력"
                        type="number"
                        placeholder="예: 3"
                        min="1"
                        max="20"
                        value={selectedClassNumber}
                        onChange={(e) => setSelectedClassNumber(Number(e.target.value))}
                        required
                     />
                )}
            </div>
        </div>

        <Input
          label="이메일"
          type="email"
          placeholder="example@email.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<MailIcon className="w-5 h-5" />}
          required
        />
        <Input
          label="비밀번호"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          icon={<LockIcon className="w-5 h-5" />}
          required
        />
        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          icon={<LockIcon className="w-5 h-5" />}
          required
        />

        <Button type="submit" fullWidth isLoading={isLoading} className="mt-4">
            가입하기
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        이미 계정이 있으신가요?{' '}
        <button onClick={onSwitchToSignIn} className="text-primary font-bold hover:text-primary-dark">
          로그인
        </button>
      </div>
    </AuthLayout>
  );
};

export default SignUpScreen;
