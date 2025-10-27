import React, { useState, useCallback } from 'react';
import { UploadCloudIcon, FileTextIcon } from './icons';

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
          // result is a data URL like "data:application/pdf;base64,..."
          // We need to strip the prefix to get the pure base64 data
          const base64Data = result.split(',')[1];
          setFileData({ data: base64Data, mimeType: file.type });
          // Show a message in the disabled textarea to confirm the PDF is loaded
          setResumeText(`PDF file "${file.name}" is loaded and ready for analysis.`);
        } else {
          // For text files, the result is the text content
          setResumeText(result);
        }
      };
      reader.onerror = () => {
        setResumeText(`Error: Could not read the file "${file.name}".`);
      };

      if (file.type === 'application/pdf') {
        // For PDF, read as data URL to get base64 encoding
        reader.readAsDataURL(file);
      } else {
        // For text, read as plain text
        reader.readAsText(file);
      }
    }
  }, []);
  
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    // If the user starts typing/pasting, clear the file upload state.
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
    <div className="flex flex-col items-center justify-center min-h-screen text-center">
      <div className="bg-[#1E1F2A] p-8 rounded-2xl shadow-2xl max-w-2xl w-full border border-gray-700/50">
        <h1 className="text-4xl font-bold text-white mb-2">AI Interview Coach</h1>
        <p className="text-gray-400 mb-8">Upload your resume or paste your self-introduction to get personalized interview questions and practice like a pro.</p>
        
        <div className="mb-6">
            <textarea
                className="w-full h-32 p-4 bg-[#2C2D3A] border-2 border-dashed border-gray-600 rounded-lg text-gray-300 placeholder-gray-500 focus:outline-none focus:border-violet-500 transition-colors disabled:bg-gray-800/50 disabled:text-gray-400"
                placeholder="Paste your resume/CV here..."
                value={resumeText}
                onChange={handleTextChange}
                disabled={!!fileData} // Disable textarea when a file is selected.
            />
        </div>

        <div className="flex items-center justify-center w-full mb-6">
            <span className="text-gray-500 mx-4">OR</span>
        </div>

        <label htmlFor="file-upload" className="w-full cursor-pointer bg-[#2C2D3A] border-2 border-dashed border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center hover:border-violet-500 hover:bg-[#353645] transition-all duration-300">
          {fileName ? (
            <>
              <FileTextIcon className="w-10 h-10 text-violet-400 mb-3" />
              <span className="text-white font-medium">{fileName}</span>
              <span className="text-gray-400 text-sm mt-1">Click to choose a different file</span>
            </>
          ) : (
             <>
              <UploadCloudIcon className="w-10 h-10 text-gray-500 mb-3" />
              <span className="text-white font-medium">Click to upload your resume</span>
              <span className="text-gray-400 text-sm mt-1">.txt, .md, or .pdf</span>
            </>
          )}
        </label>
        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".txt,.md,.pdf" />
        
        <button
          onClick={handleStartClick}
          disabled={isStartDisabled}
          className="w-full mt-8 bg-violet-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-violet-700 focus:outline-none focus:ring-4 focus:ring-violet-500/50 transition-all duration-300 text-lg shadow-lg disabled:bg-gray-600 disabled:cursor-not-allowed"
        >
          Start Interview
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;