
import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#1E1F2A] p-6 rounded-xl shadow-lg border border-gray-700/50 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
