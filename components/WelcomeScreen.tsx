
import React, { useState, useCallback } from 'react';
import { UploadCloudIcon, FileTextIcon } from './icons';
import Button from './ui/Button';

interface WelcomeScreenProps {
  onStart: (input: string | { data: string; mimeType: string }) => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStart }) => {
  const [resumeText, setResumeText] = useState('');
  const [fileName, setFileName] = useState('');
  const [fileData, setFileData] = useState<{ data: string; mimeType: string } | null>(null);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setResumeText(''); // Clear text area
      setFileData(null); // Clear previous file data

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        if (file.type === 'application/pdf') {
          const base64Data = result.split(',')[1];
          setFileData({ data: base64Data, mimeType: file.type });
          setResumeText(`PDF 파일 "${file.name}"이(가) 준비되었습니다.`);
        } else {
          setResumeText(result);
        }
      };
      reader.onerror = () => {
        setResumeText(`오류: 파일 "${file.name}"을(를) 읽을 수 없습니다.`);
      };

      if (file.type === 'application/pdf') {
        reader.readAsDataURL(file);
      } else {
        reader.readAsText(file);
      }
    }
  }, []);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setFileName('');
    setFileData(null);
    setResumeText(e.target.value);
  }

  const handleStartClick = () => {
    if (fileData) {
      onStart(fileData);
    } else {
      onStart(resumeText);
    }
  };

  const isStartDisabled = !resumeText.trim() && !fileData;

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] text-center animate-fadeIn">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border border-slate-200">
        <h1 className="text-3xl font-bold text-slate-800 mb-3">AI 면접 코치</h1>
        <p className="text-slate-600 mb-8 leading-relaxed">
            이력서나 자기소개서를 업로드하면, 직무 역량과 인성을 평가하는<br/>
            맞춤형 면접 질문을 생성해드립니다.
        </p>
        
        <div className="mb-6 relative">
            <textarea
                className="w-full h-36 p-4 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-focus focus:border-primary-focus transition-colors disabled:bg-slate-100 disabled:text-slate-500 resize-none"
                placeholder="여기에 자기소개서 내용을 직접 붙여넣기 하세요..."
                value={resumeText}
                onChange={handleTextChange}
                disabled={!!fileData} 
            />
        </div>

        <div className="flex items-center justify-center w-full mb-6">
            <div className="flex-grow border-t border-slate-200"></div>
            <span className="text-slate-400 mx-4 flex-shrink-0 text-sm font-medium">또는 파일 업로드</span>
            <div className="flex-grow border-t border-slate-200"></div>
        </div>

        <label htmlFor="file-upload" className="w-full cursor-pointer bg-slate-50 border-2 border-dashed border-slate-300 rounded-xl p-8 flex flex-col items-center justify-center hover:border-primary hover:bg-primary-lightest transition-all duration-300 group">
          {fileName ? (
            <>
              <FileTextIcon className="w-12 h-12 text-primary mb-3" />
              <span className="text-slate-700 font-semibold text-lg">{fileName}</span>
              <span className="text-slate-500 text-sm mt-2">다른 파일을 선택하려면 클릭하세요</span>
            </>
          ) : (
             <>
              <UploadCloudIcon className="w-12 h-12 text-slate-400 group-hover:text-primary mb-3 transition-colors" />
              <span className="text-slate-700 font-medium">이력서 파일 업로드</span>
              <span className="text-slate-400 text-sm mt-2">PDF, TXT, MD 형식 지원</span>
            </>
          )}
        </label>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md,.pdf" />
        
        <Button
          onClick={handleStartClick}
          disabled={isStartDisabled}
          fullWidth
          className="mt-8 py-4 text-lg"
        >
          면접 시작하기
        </Button>
      </div>
    </div>
  );
};

export default WelcomeScreen;
