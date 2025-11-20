
import React from 'react';
import { MicIcon, StopCircleIcon } from '../icons';

interface VoiceAnswerAreaProps {
    currentAnswer: string;
    onChangeAnswer: (text: string) => void;
    isRecording: boolean;
    onToggleRecording: () => void;
    isSpeechSupported: boolean;
    isReadOnly: boolean; // For document-based questions
}

const VoiceAnswerArea: React.FC<VoiceAnswerAreaProps> = ({
    currentAnswer,
    onChangeAnswer,
    isRecording,
    onToggleRecording,
    isSpeechSupported,
    isReadOnly
}) => {
    return (
        <div className="flex flex-col md:flex-row gap-6">
            {/* Left Side: Voice Controls */}
            <div className="md:w-1/3 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-slate-200 pb-6 md:pb-0 md:pr-6">
                <div className="text-center space-y-4">
                    <button
                        onClick={onToggleRecording}
                        disabled={!isSpeechSupported}
                        className={`
                            relative p-6 rounded-full transition-all duration-300
                            ${isRecording 
                                ? 'bg-red-50 hover:bg-red-100' 
                                : 'bg-slate-50 hover:bg-primary-lightest group'
                            }
                            ${!isSpeechSupported ? 'opacity-50 cursor-not-allowed' : ''}
                        `}
                        aria-label={isRecording ? "녹음 중지" : "마이크 사용"}
                    >
                        {isRecording ? (
                            <StopCircleIcon className="w-12 h-12 text-red-500" />
                        ) : (
                            <MicIcon className="w-12 h-12 text-slate-400 group-hover:text-primary" />
                        )}
                        
                        {isRecording && (
                            <span className="absolute inset-0 rounded-full bg-red-500 opacity-20 animate-ping"></span>
                        )}
                    </button>
                    
                    <div>
                        <p className={`font-bold text-lg ${isRecording ? 'text-red-500' : 'text-slate-700'}`}>
                            {isRecording ? "녹음 중..." : "음성 답변 시작"}
                        </p>
                        <p className="text-sm text-slate-500 mt-1">
                            {!isSpeechSupported 
                                ? "브라우저가 음성 인식을 지원하지 않습니다." 
                                : isRecording 
                                    ? "말씀을 멈추시면 자동으로 기록됩니다." 
                                    : "마이크 버튼을 눌러 답변을 시작하세요."
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Text Area */}
            <div className="md:w-2/3">
                <div className="relative h-full min-h-[200px]">
                    <textarea
                        value={currentAnswer}
                        onChange={(e) => onChangeAnswer(e.target.value)}
                        readOnly={isReadOnly}
                        placeholder={
                            isReadOnly 
                                ? "이 질문은 이력서/직무 기반 문항으로, 실제 면접처럼 음성으로만 답변할 수 있습니다." 
                                : "답변을 입력하거나 왼쪽의 마이크 버튼을 눌러 말해보세요..."
                        }
                        className={`
                            w-full h-full p-4 pr-28 border rounded-xl resize-none text-slate-800 leading-relaxed
                            focus:outline-none focus:ring-2 transition-colors
                            ${isReadOnly 
                                ? 'bg-slate-50 text-slate-600 border-slate-200 focus:ring-slate-200 cursor-not-allowed' 
                                : 'bg-white border-slate-300 focus:ring-primary-focus focus:border-primary-focus'
                            }
                        `}
                    />
                    {isReadOnly && (
                        <div className="absolute top-2 right-2 bg-slate-100 text-slate-500 text-xs px-2 py-1 rounded">
                            음성 답변 전용
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VoiceAnswerArea;
