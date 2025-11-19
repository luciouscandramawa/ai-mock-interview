
import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { MailIcon, LockIcon } from '../icons';

interface SignInScreenProps {
  onSignIn: (name: string, role: 'student' | 'teacher') => void;
  onSwitchToSignUp: () => void;
}

const SignInScreen: React.FC<SignInScreenProps> = ({ onSignIn, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('student@elice.io');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock authentication delay
    setTimeout(() => {
      setIsLoading(false);
      // Simple mock logic based on email
      const role = email.includes('teacher') ? 'teacher' : 'student';
      let name = email.split('@')[0];
      
      if (role === 'teacher') {
          name = '교사';
      } else if (role === 'student' && email.includes('student')) {
          name = '학생';
      }

      onSignIn(name, role);
    }, 1000);
  };

  return (
    <AuthLayout 
      title="로그인" 
      subtitle="계정에 로그인하여 서비스를 이용하세요."
    >
      <form onSubmit={handleSubmit} className="space-y-5">
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
        
        <div className="flex items-center justify-between text-sm">
            <label className="flex items-center text-slate-600 cursor-pointer">
                <input type="checkbox" className="mr-2 rounded border-slate-300 text-primary focus:ring-primary bg-white" />
                로그인 유지
            </label>
            <button type="button" className="text-primary font-medium hover:text-primary-dark">
                비밀번호 찾기
            </button>
        </div>

        <Button type="submit" fullWidth isLoading={isLoading}>
            로그인
        </Button>
      </form>

      <div className="mt-6 text-center text-sm text-slate-600">
        계정이 없으신가요?{' '}
        <button onClick={onSwitchToSignUp} className="text-primary font-bold hover:text-primary-dark">
          회원가입
        </button>
      </div>
    </AuthLayout>
  );
};

export default SignInScreen;
