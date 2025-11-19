
import React from 'react';
import type { InterviewReport } from '../types';
import InterviewReportView from './InterviewReportView';
import Button from './ui/Button';

interface ResultsScreenProps {
  report: InterviewReport;
  onRetry: () => void;
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ report, onRetry }) => {
  return (
    <div className="animate-fadeIn space-y-8">
      <h1 className="text-3xl font-bold text-center text-slate-800">면접 분석 결과</h1>
      
      <InterviewReportView report={report} />

      <div className="text-center pt-8 pb-12">
        <Button
          onClick={onRetry}
          className="px-10 py-4 text-lg"
        >
          새로운 주제로 연습하기
        </Button>
      </div>
    </div>
  );
};

export default ResultsScreen;
