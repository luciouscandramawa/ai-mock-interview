import React from 'react';
import type { InterviewReport } from '../types';
import Card from './Card';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface ResultsScreenProps {
  report: InterviewReport;
  onRetry: () => void;
}

const ScoreCircle: React.FC<{ score: number; label: string }> = ({ score, label }) => {
    const circumference = 2 * Math.PI * 45;
    const offset = circumference - (score / 10) * circumference;
    const colorClass = score >= 8 ? 'text-green-500' : score >= 5 ? 'text-primary' : 'text-red-500';

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                        className="text-slate-200"
                        strokeWidth="10"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                    />
                    <circle
                        className={colorClass}
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="transparent"
                        r="45"
                        cx="50"
                        cy="50"
                        transform="rotate(-90 50 50)"
                    />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-slate-700">{score.toFixed(1)}<span className="text-sm">/10</span></span>
            </div>
            <span className="mt-2 text-slate-600">{label}</span>
        </div>
    );
};


const ResultsScreen: React.FC<ResultsScreenProps> = ({ report, onRetry }) => {
  const totalScore = (report.scores.confidence + report.scores.contentRelevance + report.scores.fluency) / 3;
  
  return (
    <div className="space-y-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-center text-slate-800">내 결과</h1>

      <Card>
        <div className="flex flex-col md:flex-row items-center justify-around gap-8 p-4">
            <div className="text-center">
                <h2 className="text-6xl font-bold text-primary">{totalScore.toFixed(1)}</h2>
                <p className="text-slate-600">종합 점수</p>
            </div>
            <div className="w-full md:w-px h-px md:h-24 bg-slate-200"></div>
            <div className="flex justify-center gap-8">
                <ScoreCircle score={report.scores.confidence} label="자신감" />
                <ScoreCircle score={report.scores.contentRelevance} label="관련성" />
                <ScoreCircle score={report.scores.fluency} label="유창성" />
            </div>
        </div>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <h3 className="font-bold text-xl mb-4 text-green-600">강점</h3>
            <p className="text-slate-600">{report.summary.strengths}</p>
        </Card>
        <Card>
            <h3 className="font-bold text-xl mb-4 text-primary-text">개선 영역</h3>
            <p className="text-slate-600">{report.summary.areasForGrowth}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">상세 피드백</h2>
        <div className="space-y-4">
          {report.detailedFeedback.map((item, index) => (
            <div key={index} className={`p-6 rounded-lg border ${item.isCorrect ? 'bg-green-50 border-green-200' : 'bg-primary-lightest border-primary-light'}`}>
              <p className="font-semibold text-slate-700 mb-2">{item.question}</p>
              <div className="pl-4 border-l-2 border-slate-300">
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-slate-500">내 답변:</p>
                    {item.isCorrect ? 
                        <span className="flex items-center text-xs text-green-800 bg-green-100 px-2 py-0.5 rounded-full"><CheckCircleIcon className="w-3 h-3 mr-1"/> 정답</span> : 
                        <span className="flex items-center text-xs text-primary-text bg-primary-lighter px-2 py-0.5 rounded-full"><XCircleIcon className="w-3 h-3 mr-1"/> 개선 필요</span>
                    }
                </div>
                <p className="text-slate-800 italic mb-4">"{item.answer}"</p>
                <div className="bg-slate-100 p-4 rounded-lg">
                    <h4 className="font-semibold text-primary mb-2">AI 피드백 (점수: {item.score}/10)</h4>
                    <p className="text-sm text-slate-600">{item.evaluation}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">다음 단계</h2>
        <ul className="space-y-3 list-disc list-inside text-slate-600">
          {report.nextSteps.map((step, index) => (
            <li key={index}>
                <span className="font-semibold text-primary">{step.title}:</span> {step.description}
            </li>
          ))}
        </ul>
      </Card>

      <div className="text-center pt-4">
        <button
          onClick={onRetry}
          className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary-focus/50 transition-all duration-300 shadow-lg shadow-primary-focus/20"
        >
          다른 주제로 다시 시도
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;