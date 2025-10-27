import { GoogleGenAI, Type } from "@google/genai";
import type { Question, Answer, InterviewReport, StudentSummary, StudentDetail } from '../types';

// IMPORTANT: This key is managed externally and is a hard requirement.
// Do not modify this line.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
    // In a real app, you'd handle this more gracefully.
    // For this prototype, we'll throw an error if the key is missing.
    // In the target environment, this variable will be set.
    console.warn("API_KEY environment variable not set. Using a placeholder. API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const questionGenerationSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            id: { type: Type.INTEGER },
            text: { type: Type.STRING },
            type: { type: Type.STRING, enum: ['general', 'career-specific'] },
        },
        required: ['id', 'text', 'type'],
    },
};

const evaluationSchema = {
    type: Type.OBJECT,
    properties: {
        scores: {
            type: Type.OBJECT,
            properties: {
                confidence: { type: Type.NUMBER, description: "Score from 1 to 10" },
                contentRelevance: { type: Type.NUMBER, description: "Score from 1 to 10" },
                fluency: { type: Type.NUMBER, description: "Score from 1 to 10" },
            },
            required: ['confidence', 'contentRelevance', 'fluency'],
        },
        summary: {
            type: Type.OBJECT,
            properties: {
                strengths: { type: Type.STRING, description: "A paragraph summarizing the user's strengths." },
                areasForGrowth: { type: Type.STRING, description: "A paragraph summarizing areas for improvement." },
            },
            required: ['strengths', 'areasForGrowth'],
        },
        detailedFeedback: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING },
                    evaluation: { type: Type.STRING, description: "Constructive feedback on the specific answer." },
                    isCorrect: { type: Type.BOOLEAN, description: "A simple boolean indicating if the answer was good/correct." },
                    score: { type: Type.NUMBER, description: "A score from 1 to 10 for this specific answer."}
                },
                required: ['question', 'answer', 'evaluation', 'isCorrect', 'score'],
            },
        },
        nextSteps: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    title: { type: Type.STRING },
                    description: { type: Type.STRING }
                },
                required: ['title', 'description']
            }
        }
    },
    required: ['scores', 'summary', 'detailedFeedback', 'nextSteps'],
};

export const generateQuestions = async (input: string | { data: string; mimeType: string }): Promise<Question[]> => {
    let contents: any;
    const basePrompt = `
        You are an AI career coach for a vocational high school student.
        Based on the provided resume information, generate exactly 10 personalized interview questions.
        - Generate 4 general questions suitable for any job interview (e.g., teamwork, problem-solving, motivation).
        - Generate 6 career-specific questions directly related to the skills and experiences mentioned.
        Number the questions with an ID from 1 to 10.
    `;

    if (typeof input === 'string') {
        const prompt = `${basePrompt}\n\nResume Text:\n---\n${input}\n---`;
        contents = prompt;
    } else {
        contents = {
            parts: [
                { text: basePrompt },
                {
                    inlineData: {
                        data: input.data,
                        mimeType: input.mimeType,
                    },
                },
            ],
        };
    }

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
            responseMimeType: 'application/json',
            responseSchema: questionGenerationSchema,
            temperature: 0.5,
        },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Question[];
};


export const evaluateAnswers = async (questions: Question[], answers: Answer[]): Promise<InterviewReport> => {
    const interviewTranscript = questions.map(q => {
        const answer = answers.find(a => a.questionId === q.id);
        return `Question ${q.id}: ${q.text}\nAnswer: ${answer ? answer.text : '(No answer provided)'}`;
    }).join('\n\n');

    const prompt = `
        You are an AI career coach evaluating a student's mock interview performance.
        Analyze the following interview transcript. Provide a comprehensive evaluation.

        - Score confidence, content relevance, and fluency on a scale of 1 to 10 for the overall interview.
        - Write a summary of strengths and areas for growth.
        - For each question, provide detailed, constructive feedback. For the 'isCorrect' flag, be generous; mark it true if the answer is reasonable, and false for clearly poor answers. Also, provide a score from 1 to 10 for each individual answer.
        - Suggest 2-3 "Next Steps" topics for the student to practice.

        Transcript:
        ---
        ${interviewTranscript}
        ---
    `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: evaluationSchema,
        },
    });

    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as InterviewReport;
};


// --- MOCK DATA FOR TEACHER FLOW ---
// This data is now mutable and will be updated by the app.

let mockStudentList: StudentSummary[] = [
    { id: '1', name: 'Minho Kim', major: 'Automotive Engineering', latestScore: 78, improvement: 15, completed: true },
    { id: '2', name: 'Jiyoon Park', major: 'Hospitality Management', latestScore: 85, improvement: 10, completed: true },
    { id: '3', name: 'Seo-jun Lee', major: 'Computer Design', latestScore: 65, improvement: -5, completed: false },
    { id: '4', name: 'Hae-won Choi', major: 'Culinary Arts', latestScore: 92, improvement: 20, completed: true },
];

let mockStudentDetailData: { [key: string]: StudentDetail } = {
    '1': {
        id: '1',
        name: 'Minho Kim',
        major: 'Automotive Engineering',
        progressSummary: "Fluency improved by +15% since last week. Better technical explanation. Needs stronger conclusion sentences.",
        sessions: [
            { 
                question: "Why did you choose to study automotive engineering?", 
                answer: "Because I've always been interested in cars and how they work. My uncle is a mechanic and he taught me a lot.",
                evaluation: "Clear and direct answer with a good personal connection. Slight hesitation at the beginning but overall stable tone.",
                score: 8.2,
                isCorrect: true
            },
            {
                question: "Tell me about a time you solved a problem during your internship.",
                answer: "When I worked at the Hyundai repair shop, one car had a wiring issue in the hybrid system. I worked with a senior mechanic to identify the problem using diagnostic tools.",
                evaluation: "Good example and teamwork mention. Try to describe your personal contribution more clearly.",
                score: 7.8,
                isCorrect: true
            },
        ]
    },
    '2': {
        id: '2',
        name: 'Jiyoon Park',
        major: 'Hospitality Management',
        progressSummary: "Excels in polite language and customer service tone but struggles with longer, structured answers. Practicing the STAR method.",
        sessions: [
            { 
                question: "How would you handle a difficult customer complaint?", 
                answer: "I would listen patiently, apologize for the inconvenience, and try to find a solution that makes them happy, like offering a discount.",
                evaluation: "Good core principles of customer service. You could strengthen this by providing a more specific, hypothetical example.",
                score: 8.8,
                isCorrect: true,
            },
        ]
    },
    '3': {
        id: '3',
        name: 'Seo-jun Lee',
        major: 'Computer Design',
        progressSummary: "Struggles with articulating design choices and technical processes. Improvement has been slow, needs more practice sessions.",
        sessions: [
            { 
                question: "Can you describe your design process for a recent project?", 
                answer: "I just... opened Figma and started making things look good. I used a color palette I found online.",
                evaluation: "Answer lacks structure. A good response would include stages like research, wireframing, prototyping, and user feedback.",
                score: 5.5,
                isCorrect: false,
            },
        ]
    },
    '4': {
        id: '4',
        name: 'Hae-won Choi',
        major: 'Culinary Arts',
        progressSummary: "Excellent progress. Articulate and passionate about culinary techniques. Can work on providing more detailed examples of teamwork in the kitchen.",
        sessions: [
            { 
                question: "What is your favorite dish to prepare and why?", 
                answer: "I love making traditional Kimchi Jjigae. It requires careful balancing of flavors—sour, spicy, and savory. I've developed my own recipe for the broth that uses smoked anchovies, which adds a lot of depth.",
                evaluation: "Fantastic answer. It shows passion, technical knowledge, and creativity. Very memorable.",
                score: 9.5,
                isCorrect: true,
            },
        ]
    }
};

export const saveInterviewReportForStudent = (studentId: string, report: InterviewReport) => {
    const studentSummary = mockStudentList.find(s => s.id === studentId);
    const studentDetail = mockStudentDetailData[studentId];

    if (studentSummary && studentDetail) {
        const newOverallScore = (report.scores.confidence + report.scores.contentRelevance + report.scores.fluency) / 3 * 10;
        const oldScore = studentSummary.latestScore;
        const improvement = oldScore > 0 ? Math.round(((newOverallScore - oldScore) / oldScore) * 100) : 0;
        
        studentSummary.latestScore = Math.round(newOverallScore);
        studentSummary.improvement = isFinite(improvement) ? improvement : 0;
        studentSummary.completed = true;

        studentDetail.sessions = report.detailedFeedback.map(fb => ({
            question: fb.question,
            answer: fb.answer,
            evaluation: fb.evaluation,
            score: fb.score,
            isCorrect: fb.isCorrect,
        }));
        studentDetail.progressSummary = `${report.summary.strengths} However, ${report.summary.areasForGrowth}`;
    }
};


export const getTeacherDashboardData = async (): Promise<StudentSummary[]> => {
    await new Promise(res => setTimeout(res, 500));
    return JSON.parse(JSON.stringify(mockStudentList));
};

export const getStudentDetails = async (studentId: string): Promise<StudentDetail> => {
    await new Promise(res => setTimeout(res, 700));
    const studentData = mockStudentDetailData[studentId];
    if (!studentData) {
        throw new Error("Student not found");
    }
    return JSON.parse(JSON.stringify(studentData));
};
