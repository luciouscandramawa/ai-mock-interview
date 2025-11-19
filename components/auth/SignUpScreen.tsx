
import React, { useState } from 'react';
import AuthLayout from './AuthLayout';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { MailIcon, LockIcon, UserIcon } from '../icons';

interface SignUpScreenProps {
  onSignUp: (name: string, role: 'student' | 'teacher') => void;
  onSwitchToSignIn: () => void;
}

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onSignUp, onSwitchToSignIn }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(password !== confirmPassword) {
        alert("비밀번호가 일치하지 않습니다.");
        return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      onSignUp(name, 'student'); // Default to student for new signups
    }, 1000);
  };

  return (
    <AuthLayout 
      title="회원가입" 
      subtitle="새로운 계정을 만들고 시작해보세요."
    >
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

        <Button type="submit" fullWidth isLoading={isLoading} className="mt-2">
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
