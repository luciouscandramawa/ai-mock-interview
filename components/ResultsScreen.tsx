
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
    const colorClass = score >= 8 ? 'text-green-400' : score >= 5 ? 'text-yellow-400' : 'text-red-400';

    return (
        <div className="flex flex-col items-center">
            <div className="relative w-28 h-28">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                    <circle
                        className="text-gray-700"
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
                <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white">{score}<span className="text-sm">/10</span></span>
            </div>
            <span className="mt-2 text-gray-400">{label}</span>
        </div>
    );
};


const ResultsScreen: React.FC<ResultsScreenProps> = ({ report, onRetry }) => {
  const totalScore = (report.scores.confidence + report.scores.contentRelevance + report.scores.fluency) / 3;
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-center text-white">Your Results</h1>

      <Card>
        <div className="flex flex-col md:flex-row items-center justify-around gap-8">
            <div className="text-center">
                <h2 className="text-6xl font-bold text-violet-400">{totalScore.toFixed(1)}</h2>
                <p className="text-gray-400">Overall Score</p>
            </div>
            <div className="w-full md:w-px h-px md:h-24 bg-gray-700"></div>
            <div className="flex justify-center gap-8">
                <ScoreCircle score={report.scores.confidence} label="Confidence" />
                <ScoreCircle score={report.scores.contentRelevance} label="Relevance" />
                <ScoreCircle score={report.scores.fluency} label="Fluency" />
            </div>
        </div>
      </Card>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <h3 className="font-bold text-xl mb-4 text-green-400">Strengths</h3>
            <p className="text-gray-300">{report.summary.strengths}</p>
        </Card>
        <Card>
            <h3 className="font-bold text-xl mb-4 text-yellow-400">Areas for Growth</h3>
            <p className="text-gray-300">{report.summary.areasForGrowth}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-white">Detailed Feedback</h2>
        <div className="space-y-4">
          {report.detailedFeedback.map((item, index) => (
            <div key={index} className={`p-6 rounded-lg border ${item.isCorrect ? 'bg-green-900/30 border-green-500/30' : 'bg-red-900/30 border-red-500/30'}`}>
              <p className="font-semibold text-gray-300 mb-2">{item.question}</p>
              <div className="pl-4 border-l-2 border-gray-600">
                <div className="flex items-center gap-2 mb-2">
                    <p className="text-sm text-gray-400">Your Answer:</p>
                    {item.isCorrect ? 
                        <span className="flex items-center text-xs text-green-400 bg-green-900/50 px-2 py-0.5 rounded-full"><CheckCircleIcon className="w-3 h-3 mr-1"/> Correct</span> : 
                        <span className="flex items-center text-xs text-red-400 bg-red-900/50 px-2 py-0.5 rounded-full"><XCircleIcon className="w-3 h-3 mr-1"/> Incorrect</span>
                    }
                </div>
                <p className="text-gray-200 italic mb-3">"{item.answer}"</p>
                <p className="text-gray-300">{item.evaluation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="text-2xl font-bold mb-4 text-white">Next Steps</h2>
        <ul className="space-y-3 list-disc list-inside text-gray-300">
          {report.nextSteps.map((step, index) => (
            <li key={index}>
                <span className="font-semibold text-violet-300">{step.title}:</span> {step.description}
            </li>
          ))}
        </ul>
      </Card>

      <div className="text-center pt-4">
        <button
          onClick={onRetry}
          className="px-8 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/50 transition-all duration-300"
        >
          Try Another Topic
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
