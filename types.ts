
export interface School {
    id: string;
    name: string;
}

export interface Question {
  id: number;
  text: string;
  type: 'general' | 'resume-based';
}

export interface Answer {
  questionId: number;
  text: string;
}

export interface DetailedFeedback {
    question: string;
    answer: string;
    evaluation: string;
    isCorrect: boolean;
    score: number;
}

export interface InterviewReport {
  scores: {
    contentRelevance: number; // 40%
    structure: number;        // 30%
    fluency: number;          // 20%
    confidence: number;       // 10%
  };
  totalScore: number;
  summary: {
    strengths: string;
    areasForGrowth: string;
  };
  detailedFeedback: DetailedFeedback[];
  nextSteps: {
    title: string;
    description: string;
  }[];
}


export interface StudentSummary {
  id: string;
  name: string;
  major: string; // Still useful for context, even if not used for filtering
  schoolId: string;
  grade: number;       // 1, 2, 3
  classNumber: number; // 1, 2, 3...
  latestScore: number;
  improvement: number; // as a percentage
  completed: boolean;
}

// StudentDetail now holds the full report instead of a partial session list
export interface StudentDetail {
    id: string;
    name: string;
    major: string;
    schoolId: string;
    grade: number;
    classNumber: number;
    report?: InterviewReport;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: 'student' | 'teacher';
    schoolId?: string;
    schoolName?: string; 
    grade?: number;       // Year (1, 2, 3)
    classNumber?: number; // Class (1, 2, 3...) - Optional for teachers
    className?: string;   // Generated string "1학년 2반"
    avatarUrl?: string;
}

export type AuthView = 'signin' | 'signup';
