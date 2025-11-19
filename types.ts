
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
  major: string;
  latestScore: number;
  improvement: number; // as a percentage
  completed: boolean;
}

// StudentDetail now holds the full report instead of a partial session list
export interface StudentDetail {
    id: string;
    name: string;
    major: string;
    report?: InterviewReport;
}

export interface User {
    name: string;
    email: string;
    role: 'student' | 'teacher';
    avatarUrl?: string;
}

export type AuthView = 'signin' | 'signup';
