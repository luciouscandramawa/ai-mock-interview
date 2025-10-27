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

import React, { useState, useEffect, useRef } from 'react';
import type { Question, Answer } from '../types';
import Card from './Card';
import { MicIcon, StopCircleIcon } from './icons';

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

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef(''); // Kept for sync with textarea, but not for submission logic
  const finalTranscriptRef = useRef(''); // Stores the committed transcript
  
  // Ref to hold the isRecording state to avoid stale closures in event handlers
  const isRecordingRef = useRef(isRecording);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);


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
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let interimTranscript = '';
      // Iterate from the first new result
      for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i];
          if (result.isFinal) {
              // This segment is final, append it to our ref
              finalTranscriptRef.current += result[0].transcript;
          } else {
              // This is an interim segment, store it temporarily
              interimTranscript += result[0].transcript;
          }
      }
      // The full answer is the committed final text plus the current interim text
      const fullTranscript = finalTranscriptRef.current + interimTranscript;
      // Update state for UI display
      setCurrentAnswer(fullTranscript);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      // The 'no-speech' error is fired when the user stops talking.
      // We ignore it and let the `onend` handler restart recognition if needed.
      if (event.error === 'no-speech') {
        return;
      }

      console.error('Speech recognition error:', event.error);
      // For a critical error like not-allowed, stop everything and update state.
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        setIsSpeechSupported(false);
        setIsRecording(false);
      }
    };
    
    recognition.onend = () => {
      // The recognition service has stopped. Check if it should be restarted.
      // isRecordingRef.current reflects the user's desired state (i.e., did they click stop?).
      if (isRecordingRef.current) {
        // If we are supposed to be recording, start it again.
        // This handles cases where the browser times out due to silence.
        try {
            recognition.start();
        } catch(e) {
            // This can happen if start() is called while it's already starting.
            console.error("Recognition restart failed", e);
        }
      }
    };

    // Cleanup on unmount
    return () => {
      isRecordingRef.current = false; // Ensure it doesn't restart on unmount
      if (recognitionRef.current) {
        recognitionRef.current.onend = null; // Prevent onend from firing during unmount
        recognitionRef.current.onerror = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.stop();
      }
    };
  }, []); // Run only once on mount

  const toggleRecording = () => {
    if (!recognitionRef.current) return;
    
    const newIsRecording = !isRecording;
    setIsRecording(newIsRecording);

    if (newIsRecording) {
      setCurrentAnswer(''); // Clear previous answer on new recording start
      transcriptRef.current = '';
      finalTranscriptRef.current = ''; // Reset final transcript
      recognitionRef.current.start();
    } else {
      recognitionRef.current.stop();
    }
  };

  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;
  const isVerbalOnly = currentQuestion.type === 'career-specific';
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  const stopCurrentRecording = () => {
    // Use the ref for the most up-to-date value to avoid stale state issues.
    if (isRecordingRef.current) {
      setIsRecording(false);
      recognitionRef.current?.stop();
    }
  };

  useEffect(() => {
    setCurrentAnswer('');
    transcriptRef.current = '';
    finalTranscriptRef.current = ''; // Reset final transcript for new question
    stopCurrentRecording();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestionIndex]);

  const handleNext = () => {
    stopCurrentRecording();
    const newAnswer: Answer = {
      questionId: currentQuestion.id,
      // FIX: Use the state variable `currentAnswer` which is the source of truth for the UI.
      // This ensures that exactly what the user sees is what gets submitted, fixing the race condition.
      text: currentAnswer,
    };
    const updatedAnswers = [...answers, newAnswer];
    setAnswers(updatedAnswers);

    if (isLastQuestion) {
      onFinish(updatedAnswers);
    } else {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)]">
      <div className="w-full max-w-3xl space-y-6">
        <div>
          <div className="flex justify-between mb-1 text-sm text-gray-400">
            <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
            <span className="capitalize">{currentQuestion.type}</span>
          </div>
          <div className="w-full bg-[#2C2D3A] rounded-full h-2.5">
            <div className="bg-violet-600 h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
          </div>
        </div>
        
        <Card>
            <p className="text-gray-400 mb-4 font-semibold tracking-wider uppercase text-xs">Interview Question</p>
            <h2 className="text-2xl font-bold text-white leading-tight">
                {currentQuestion.text}
            </h2>
        </Card>

        <Card>
            <p className="text-gray-400 mb-4 font-semibold">A. Please fill out the answer.</p>
            <textarea
                value={currentAnswer}
                onChange={(e) => {
                    setCurrentAnswer(e.target.value);
                    transcriptRef.current = e.target.value;
                }}
                placeholder={isVerbalOnly ? "This is a verbal-only question. Click the microphone to record..." : "Type or use the microphone to record your answer..."}
                readOnly={isVerbalOnly}
                className="w-full h-48 p-4 bg-[#10111A] border border-gray-700 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors read-only:bg-[#1E1F2A] read-only:cursor-not-allowed"
            />
            {!isSpeechSupported && <p className="text-xs text-yellow-400 mt-2">Speech recognition is not supported or permission was denied.</p>}
            <div className="mt-4 flex justify-between items-center">
                <button 
                  onClick={toggleRecording}
                  disabled={!isSpeechSupported}
                  className="relative p-3 rounded-full hover:bg-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                  aria-label={isRecording ? "Stop recording" : "Use microphone"}
                >
                    {isRecording ? <StopCircleIcon className="w-6 h-6 text-red-400" /> : <MicIcon className="w-6 h-6 text-gray-400" />}
                    {isRecording && <span className="absolute top-0 left-0 w-full h-full bg-red-400 rounded-full animate-ping opacity-50"></span>}
                </button>
                <button
                    onClick={handleNext}
                    disabled={!currentAnswer.trim()}
                    className="px-8 py-3 bg-violet-600 text-white font-bold rounded-lg hover:bg-violet-700 disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-violet-500/50 transition-all duration-300"
                >
                    {isLastQuestion ? 'Finish & See Results' : 'Submit & Next'}
                </button>
            </div>
        </Card>
      </div>
    </div>
  );
};

export default InterviewSession;