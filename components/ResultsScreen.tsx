
import React from 'react';
import type { InterviewReport } from '../types';
import Card from './Card';
import { CheckCircleIcon, XCircleIcon } from './icons';

interface ResultsScreenProps {
  report: InterviewReport;
  onRetry: () => void;
}

// Radar Chart Component
const RadarChart: React.FC<{ scores: { contentRelevance: number; structure: number; fluency: number; confidence: number } }> = ({ scores }) => {
    const size = 300;
    const center = size / 2;
    const radius = 100;
    const maxScore = 10;

    // Dimensions
    const axes = [
        { label: "내용 관련성", key: "contentRelevance", angle: 0 },      // Top
        { label: "구조 (STAR)", key: "structure", angle: Math.PI / 2 },   // Right
        { label: "유창성", key: "fluency", angle: Math.PI },              // Bottom
        { label: "자신감", key: "confidence", angle: 3 * Math.PI / 2 },   // Left
    ];

    // Calculate coordinates for a point given a score and angle
    const getCoordinates = (score: number, angle: number) => {
        const r = (score / maxScore) * radius;
        const x = center + r * Math.cos(angle - Math.PI / 2); // Rotate -90deg to start from top
        const y = center + r * Math.sin(angle - Math.PI / 2);
        return { x, y };
    };

    // Background grids (concentric polygons)
    const levels = [2, 4, 6, 8, 10];
    const gridPolygons = levels.map(level => {
        const points = axes.map(axis => {
            const { x, y } = getCoordinates(level, axis.angle);
            return `${x},${y}`;
        }).join(' ');
        return <polygon key={level} points={points} fill="none" stroke="#e2e8f0" strokeWidth="1" />;
    });

    // Axis lines
    const axisLines = axes.map((axis, index) => {
        const { x, y } = getCoordinates(maxScore, axis.angle);
        return <line key={index} x1={center} y1={center} x2={x} y2={y} stroke="#cbd5e1" strokeWidth="1" />;
    });

    // Data polygon
    const dataPoints = axes.map(axis => {
        const score = scores[axis.key as keyof typeof scores];
        const { x, y } = getCoordinates(score, axis.angle);
        return `${x},${y}`;
    }).join(' ');

    // Labels
    const labels = axes.map((axis, index) => {
         // Push labels out a bit further than the radius
        const { x, y } = getCoordinates(maxScore + 2.5, axis.angle);
        return (
            <text 
                key={index} 
                x={x} 
                y={y} 
                textAnchor="middle" 
                dominantBaseline="middle" 
                className="text-xs font-medium fill-slate-600"
            >
                {axis.label}
            </text>
        );
    });

    return (
        <div className="flex justify-center py-4">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g>
                    {gridPolygons}
                    {axisLines}
                    <polygon points={dataPoints} fill="rgba(103, 0, 230, 0.2)" stroke="#6700e6" strokeWidth="2" />
                    {axes.map((axis, i) => {
                         const score = scores[axis.key as keyof typeof scores];
                         const { x, y } = getCoordinates(score, axis.angle);
                         return <circle key={i} cx={x} cy={y} r="4" fill="#6700e6" />
                    })}
                    {labels}
                </g>
            </svg>
        </div>
    );
};


const ResultsScreen: React.FC<ResultsScreenProps> = ({ report, onRetry }) => {
  
  return (
    <div className="space-y-8 animate-fadeIn">
      <h1 className="text-3xl font-bold text-center text-slate-800">면접 분석 결과</h1>

      <div className="grid md:grid-cols-2 gap-6">
          <Card className="flex flex-col justify-center items-center">
             <h3 className="text-slate-500 font-medium uppercase tracking-wide mb-2">종합 점수</h3>
             <div className="relative">
                <div className="text-6xl font-bold text-primary">{report.totalScore.toFixed(1)}<span className="text-2xl text-slate-400 font-normal">/10</span></div>
             </div>
             <div className="mt-4 space-y-1 text-sm text-slate-600">
                 <div className="flex justify-between w-48 border-b border-slate-100 py-1"><span>내용 관련성 (40%)</span> <span className="font-bold">{report.scores.contentRelevance}</span></div>
                 <div className="flex justify-between w-48 border-b border-slate-100 py-1"><span>구조 (30%)</span> <span className="font-bold">{report.scores.structure}</span></div>
                 <div className="flex justify-between w-48 border-b border-slate-100 py-1"><span>유창성 (20%)</span> <span className="font-bold">{report.scores.fluency}</span></div>
                 <div className="flex justify-between w-48 py-1"><span>자신감 (10%)</span> <span className="font-bold">{report.scores.confidence}</span></div>
             </div>
          </Card>
          
          <Card>
              <h3 className="text-center text-slate-500 font-medium uppercase tracking-wide mb-2">역량 분석</h3>
              <RadarChart scores={report.scores} />
          </Card>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
            <h3 className="font-bold text-xl mb-4 text-green-600 flex items-center gap-2">
                <CheckCircleIcon className="w-5 h-5" /> 강점
            </h3>
            <p className="text-slate-600 leading-relaxed">{report.summary.strengths}</p>
        </Card>
        <Card>
            <h3 className="font-bold text-xl mb-4 text-primary flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><line x1="12" y1="19" x2="12" y2="5"></line><polyline points="5 12 12 5 19 12"></polyline></svg>
                개선이 필요한 부분
            </h3>
            <p className="text-slate-600 leading-relaxed">{report.summary.areasForGrowth}</p>
        </Card>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">문항별 상세 피드백</h2>
        <div className="space-y-6">
          {report.detailedFeedback.map((item, index) => (
            <div key={index} className={`p-6 rounded-lg border ${item.isCorrect ? 'bg-green-50 border-green-200' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${item.isCorrect ? 'bg-green-200 text-green-700' : 'bg-primary-light text-primary'}`}>
                      Q{index + 1}
                  </div>
                  <div className="flex-grow">
                    <p className="font-semibold text-slate-800 mb-3 text-lg">{item.question}</p>
                    
                    <div className="bg-white/60 p-4 rounded-md border border-slate-200 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold uppercase text-slate-500">내 답변</span>
                        </div>
                        <p className="text-slate-700 italic">"{item.answer}"</p>
                    </div>

                    <div className={`p-4 rounded-md ${item.isCorrect ? 'bg-green-100/50' : 'bg-primary-lightest'}`}>
                         <div className="flex justify-between items-center mb-2">
                            <h4 className={`font-bold text-sm ${item.isCorrect ? 'text-green-800' : 'text-primary'}`}>AI 코치의 조언</h4>
                            <span className="font-bold text-sm bg-white px-2 py-1 rounded shadow-sm">점수: {item.score}/10</span>
                         </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{item.evaluation}</p>
                    </div>
                  </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Card>
        <h2 className="text-2xl font-bold mb-4 text-slate-800">다음 학습 추천</h2>
        <ul className="space-y-4">
          {report.nextSteps.map((step, index) => (
            <li key={index} className="flex gap-4 items-start">
                <div className="bg-primary-light text-primary font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-1">{index + 1}</div>
                <div>
                    <span className="font-bold text-slate-800 block mb-1">{step.title}</span>
                    <span className="text-slate-600">{step.description}</span>
                </div>
            </li>
          ))}
        </ul>
      </Card>

      <div className="text-center pt-8 pb-12">
        <button
          onClick={onRetry}
          className="px-10 py-4 bg-primary text-white font-bold rounded-xl hover:bg-primary-dark focus:outline-none focus:ring-4 focus:ring-primary-focus/50 transition-all duration-300 shadow-lg shadow-primary-focus/30 text-lg"
        >
          새로운 주제로 연습하기
        </button>
      </div>
    </div>
  );
};

export default ResultsScreen;
