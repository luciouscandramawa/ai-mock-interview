
import React, { useState, useRef, useEffect } from 'react';
import { User } from '../../types';
import { LogOutIcon, ChevronDownIcon, GraduationCapIcon, EliceLogoIcon } from '../icons';

interface NavbarProps {
  user: User;
  onLogout: () => void;
  onToggleRole: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onToggleRole }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="text-primary w-24">
                 <EliceLogoIcon />
              </div>
              <span className="text-xl font-bold text-slate-800 tracking-tight">AI 역량 평가</span>
            </div>
          </div>

          {/* Right Side - User Menu */}
          <div className="flex items-center">
            <div className="relative ml-3" ref={menuRef}>
              <div>
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="flex items-center gap-3 max-w-xs bg-white rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary p-1 pr-3 hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-200"
                >
                  <div className="h-8 w-8 rounded-full bg-primary-light flex items-center justify-center text-primary font-bold text-sm">
                     {user.name[0]}
                  </div>
                  <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-slate-700">{user.name}</span>
                      <span className="text-xs text-slate-500">{user.role === 'teacher' ? '교사' : '학생'}</span>
                  </div>
                  <ChevronDownIcon className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
                </button>
              </div>

              {isMenuOpen && (
                <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-xl shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none animate-fadeIn overflow-hidden z-50">
                  <div className="py-1 divide-y divide-slate-100">
                    <div className="px-4 py-3 bg-slate-50">
                      <p className="text-sm text-slate-900 font-bold">{user.schoolName}</p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        {user.className ? user.className : (user.grade ? `${user.grade}학년` : '')}
                      </p>
                      <p className="text-xs text-slate-400 mt-1 truncate">{user.email}</p>
                    </div>
                    <div className="py-1">
                        <button
                            onClick={() => {
                                onToggleRole();
                                setIsMenuOpen(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                        >
                            <GraduationCapIcon className="w-4 h-4 text-slate-500" />
                            {user.role === 'student' ? '교사 모드로 전환 (데모)' : '학생 모드로 전환 (데모)'}
                        </button>
                    </div>
                    <div className="py-1">
                      <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                      >
                        <LogOutIcon className="w-4 h-4" />
                        로그아웃
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
