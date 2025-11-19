
// Fix: Added type definitions for the Web Speech API to resolve TypeScript errors about SpeechRecognition.
// Manually define types for the Web Speech API as they are not standard in all TS lib files.
interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionResult {
  isFinal: boolean;
  [index: number]: SpeechRecognitionAlternative;
  length: number;
}

interface SpeechRecognitionResultList {
  [index: number]: SpeechRecognitionResult;
  length: number;
}

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  onstart: (() => void) | null;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
}

// Extend the Window interface
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Question, Answer } from '../types';
import Card from './Card';
import Button from './ui/Button';
import { MicIcon, StopCircleIcon, LightbulbIcon, ClockIcon } from './icons';

interface InterviewSessionProps {
  questions: Question[];
  onFinish: (answers: Answer[]) => void;
}

const InterviewSession: React.FC<InterviewSessionProps> = ({ questions, onFinish }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState('');
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [timeLeft, setTimeLeft] = useState(60);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTranscriptRef = useRef(''); // Stores the committed transcript
  
  const isRecordingRef = useRef(isRecording);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  const stopCurrentRecording = useCallback(() => {
    if (isRecordingRef.current) {
      setIsRecording(false);
      recognitionRef.current?.stop();
    }
  }, []);

  const handleNext = useCallback(() => {
    stopCurrentRecording();
    const newAnswer: Answer = {
      questionId: questions[currentQuestionIndex].id,
      text: currentAnswer,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (currentQuestionIndex === questions.length - 1) {
      onFinish(updatedAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  }, [answers, currentAnswer, currentQuestionIndex, onFinish, questions, stopCurrentRecording]);
  
  useEffect(() => {
    setTimeLeft(60); // Reset timer on question change
    const timerId = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timerId);
  }, [currentQuestionIndex]);

  useEffect(() => {
    if (timeLeft === 0) {
      handleNext();
    }
  }, [timeLeft, handleNext]);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'ko-KR'; // Set language to Korean

    recognition.onresult = (event) => {
      let interimTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
              finalTranscriptRef.current += result[0].transcript;
          } else {
              interimTranscript += result[0].transcript;
          }
      }
      const fullTranscript = finalTranscriptRef.current + interimTranscript;
      setCurrentAnswer(fullTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech') return;
      console.error('Speech recognition error:', event.error);
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsSpeechSupported(false);
        setIsRecording(false);
      }
    };
    
    recognition.onend = () => {
      if (isRecordingRef.current) {
        try {
            recognition.start();
        } catch(e) {
            console.error("Recognition restart failed", e);
        }
      }
    };

    return () => {
      isRecordingRef.current = false;
      if (recognitionRef.current) {
        recognitionRef.current.onend = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    
    const newIsRecording = !isRecording;
    setIsRecording(newIsRecording);

    if (newIsRecording) {
      setCurrentAnswer('');
      finalTranscriptRef.current = '';
      recognitionRef.current.start();
    } else {
      recognitionRef.current.stop();
    }
  };
  
  useEffect(() => {
    setCurrentAnswer('');
    finalTranscriptRef.current = '';
    stopCurrentRecording();
  }, [currentQuestionIndex, stopCurrentRecording]);

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isCareerQuestion = currentQuestion.type === 'resume-based';
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] animate-fadeIn">
      <div className="w-full max-w-3xl space-y-6">
        <div>
          <div className="flex justify-between items-center mb-2">
            <div>
              <span className="text-sm text-slate-500">질문 {currentQuestionIndex + 1} / {questions.length}</span>
              <span className={`ml-3 inline-block font-medium text-xs text-primary-text px-2 py-1 rounded-full ${isCareerQuestion ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                {isCareerQuestion ? '이력서/직무 기반' : '일반/인성'}
              </span>
            </div>
            <div className="flex items-center gap-2 font-sans text-primary font-bold text-2xl">
              <ClockIcon className="w-6 h-6" />
              <span>{timeLeft}초</span>
            </div>
          </div>
          <div className="w-full bg-slate-200 rounded-full h-2.5">
            <div className="bg-primary h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
        
        <Card>
            <p className="text-sm text-slate-500 mb-4 font-semibold tracking-wider uppercase">AI 면접관</p>
            <h2 className="text-2xl font-bold text-slate-800 leading-tight">
                {currentQuestion.text}
            </h2>
        </Card>

        <Card>
            <div className="flex justify-between items-center mb-4">
                <p className="text-slate-600 font-medium">A. 답변</p>
                <div className="text-xs bg-yellow-100 text-yellow-800 px-3 py-1.5 rounded-full flex items-center">
                    <LightbulbIcon className="w-4 h-4 mr-1.5" />
                    <span>팁: "매출이 20% 올랐습니다"처럼 구체적인 수치를 사용하여 답변해보세요.</span>
                </div>
            </div>
            <textarea
                value={currentAnswer}
                onChange={(e) => setCurrentAnswer(e.target.value)}
                placeholder="답변을 입력하거나 마이크 버튼을 눌러 말해보세요..."
                className="w-full h-48 p-4 bg-white border border-slate-300 rounded-md text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-primary-focus transition-colors"
            />
            {!isSpeechSupported && <p className="text-xs text-red-600 mt-2">이 브라우저는 음성 인식을 지원하지 않거나 권한이 거부되었습니다.</p>}
            <div className="mt-4 flex justify-between items-center">
                <button 
                  onClick={toggleRecording}
                  disabled={!isSpeechSupported}
                  className="relative p-3 rounded-full hover:bg-primary-lightest disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                  aria-label={isRecording ? "녹음 중지" : "마이크 사용"}
                >
                    {isRecording ? <StopCircleIcon className="w-6 h-6 text-red-500" /> : <MicIcon className="w-6 h-6 text-slate-500" />}
                    {isRecording && <span className="absolute top-0 left-0 w-full h-full bg-red-500 rounded-full animate-ping opacity-50"></span>}
                </button>
                <Button
                    onClick={handleNext}
                    disabled={!currentAnswer.trim()}
                    className="px-8"
                >
                    {isLastQuestion ? '면접 종료 및 결과 확인' : '다음 질문'}
                </Button>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewSession;
