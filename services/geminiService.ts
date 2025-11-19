
import { GoogleGenAI, Type } from "@google/genai";
import type { Question, Answer, InterviewReport, StudentSummary, StudentDetail } from '../types';

// IMPORTANT: This key is managed externally and is a hard requirement.
// Do not modify this line.
const API_KEY = process.env.API_KEY;
if (!API_KEY) {
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
            type: { type: Type.STRING, enum: ['general', 'resume-based'] },
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
                contentRelevance: { type: Type.NUMBER, description: "Score from 0 to 10 based on meaningfulness" },
                structure: { type: Type.NUMBER, description: "Score from 0 to 10 based on STAR method usage" },
                fluency: { type: Type.NUMBER, description: "Score from 0 to 10 based on flow and grammar" },
                confidence: { type: Type.NUMBER, description: "Score from 0 to 10 based on tone and stability" },
            },
            required: ['contentRelevance', 'structure', 'fluency', 'confidence'],
        },
        summary: {
            type: Type.OBJECT,
            properties: {
                strengths: { type: Type.STRING, description: "A paragraph in Korean summarizing the user's strengths." },
                areasForGrowth: { type: Type.STRING, description: "A paragraph in Korean summarizing areas for improvement." },
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
                    evaluation: { type: Type.STRING, description: "Constructive feedback in Korean. Encourage quantifying answers." },
                    isCorrect: { type: Type.BOOLEAN, description: "True if answer is good, false if poor." },
                    score: { type: Type.NUMBER, description: "Score from 1 to 10."}
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
    
    // Jobda / PDF Context for style
    const interviewContext = `
    참고할 면접 질문 유형 (Jobda 스타일 - 특성화고/직무 중심):
    1. 비전/목표 (Vision/Goals): 입사 후 포부, 5년/10년 후 모습, 직업관, 일의 목적.
    2. 조직적응력 (Organizational Adaptability): 상사와의 갈등 해결, 협력 경험, 야근/지방 근무 가능 여부.
    3. 창의성/돌발 (Spontaneous/Creativity): 붉은 벽돌의 5가지 용도, 서울의 중국집 매출 추산 등 논리적 사고.
    4. 가치관/인성 (Interests/Values): 존경하는 인물, 감명 깊은 영화, 스트레스 해소법.
    5. 직무 적합성 (Job Fit): 지원 동기, 직무 관련 강점, 전공과 직무의 연관성.
    `;

    const basePrompt = `
        당신은 특성화고 학생을 위한 전문 AI 면접 코치입니다.
        제공된 이력서 정보를 바탕으로 한국어로 정확히 10개의 맞춤형 면접 질문을 생성하세요.
        
        다음 규칙을 엄격히 따르세요:
        1. **이력서/직무 기반 질문 (resume-based)**: 5개. 학생의 기술, 프로젝트 경험, 자격증 등 구체적인 이력에 기반해야 합니다.
        2. **일반/인성 질문 (general)**: 5개. 위에서 제공한 '비전/목표', '조직적응력', '창의성' 등의 주제를 참고하여 생성하세요.
        3. 모든 질문은 한국어로 작성되어야 합니다.
        4. ID는 1부터 10까지 부여하세요.

        ${interviewContext}
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
            temperature: 0.6,
        },
    });
    
    const jsonText = response.text.trim();
    return JSON.parse(jsonText) as Question[];
};


export const evaluateAnswers = async (questions: Question[], answers: Answer[]): Promise<InterviewReport> => {
    const interviewTranscript = questions.map(q => {
        const answer = answers.find(a => a.questionId === q.id);
        return `질문 ${q.id}: ${q.text}\n답변: ${answer ? answer.text : '(답변 없음)'}`;
    }).join('\n\n');

    const prompt = `
        당신은 AI 면접관입니다. 특성화고 학생의 모의 면접 결과를 평가하세요. 
        평가 언어는 **한국어**입니다.

        다음 4가지 차원에서 점수(0~10)를 매기고 상세 피드백을 제공하세요:

        1. **내용 관련성 (Content Relevance - 40%)**: 
           - 질문의 의도를 정확히 파악하고 의미 있는 답변을 했는가?
           - 핵심 키워드가 포함되었는가?
        
        2. **구조 (Structure - 30%)**:
           - STAR 기법 (상황, 과제, 행동, 결과)을 사용하여 논리적으로 답변했는가?
           - 서론-본론-결론이 명확한가?

        3. **유창성 (Fluency - 20%)**:
           - 문장이 자연스럽게 이어지는가?
           - 불필요한 추임새(음, 어, 그..)가 적은가?
           - 단답형이 아닌 충분한 길이로 답변했는가?

        4. **자신감 (Confidence Proxy - 10%)**:
           - 답변의 내용에서 확신과 열정이 느껴지는가?
           - (텍스트 분석) 망설임이나 자신감 없는 표현이 적은가?

        **중요 피드백 지침**:
        - 학생에게 **수치로 답변(Quantify)**하도록 적극 권장하세요. (예: "많이 팔았다" 대신 "매출을 20% 늘렸다"라고 표현하도록 조언)
        - 구체적인 개선 방안을 제시하세요.
        
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

    const result = JSON.parse(response.text.trim()) as InterviewReport;
    
    // Calculate weighted total score
    // TotalScore = 0.4 * CR + 0.3 * ST + 0.2 * FL + 0.1 * CP
    const { contentRelevance, structure, fluency, confidence } = result.scores;
    const weightedScore = (contentRelevance * 0.4) + (structure * 0.3) + (fluency * 0.2) + (confidence * 0.1);
    result.totalScore = Number(weightedScore.toFixed(1));

    return result;
};


// --- MOCK DATA FOR TEACHER FLOW (Updated for Korean Context) ---

let mockStudentList: StudentSummary[] = [
    { id: '1', name: '김민호', major: '자동차 공학', latestScore: 78, improvement: 15, completed: true },
    { id: '2', name: '박지윤', major: '호텔 경영', latestScore: 85, improvement: 10, completed: true },
    { id: '3', name: '이서준', major: '컴퓨터 디자인', latestScore: 65, improvement: -5, completed: false },
    { id: '4', name: '최혜원', major: '조리 과학', latestScore: 92, improvement: 20, completed: true },
];

// Helper to generate a mock report
const createMockReport = (score: number, name: string): InterviewReport => ({
    scores: {
        contentRelevance: score > 80 ? 9 : 7,
        structure: score > 80 ? 8 : 6,
        fluency: score > 80 ? 9 : 7,
        confidence: score > 80 ? 8 : 6
    },
    totalScore: score / 10,
    summary: {
        strengths: `${name} 학생은 직무에 대한 이해도가 높고 경험을 구체적으로 설명할 수 있습니다. 특히 프로젝트 성과를 수치로 제시한 점이 인상적입니다.`,
        areasForGrowth: "답변의 구조가 다소 느슨할 때가 있습니다. STAR 기법을 더 엄격하게 적용하여 서론-본론-결론을 명확히 하면 좋겠습니다."
    },
    detailedFeedback: [
        {
            question: "본인의 강점은 무엇인가요?",
            answer: "저는 꼼꼼함이 강점입니다. 실수를 잘 안 합니다.",
            evaluation: "강점을 언급했지만 구체적인 사례가 부족합니다. 어떤 프로젝트에서 꼼꼼함으로 문제를 예방했는지 설명해보세요.",
            isCorrect: true,
            score: 7
        },
        {
            question: "어려움을 극복한 경험을 말해주세요.",
            answer: "프로젝트 마감기한이 짧아서 힘들었지만, 밤새서 열심히 해서 끝냈습니다.",
            evaluation: "열정은 좋지만, 단순히 '열심히'보다는 시간 관리를 어떻게 했는지, 팀원과 어떻게 협력했는지 구체적인 방법론(Action)이 필요합니다.",
            isCorrect: true,
            score: 6
        }
    ],
    nextSteps: [
        { title: "STAR 기법 훈련", description: "상황-과제-행동-결과 구조로 답변 작성하기 연습" },
        { title: "모의 면접 반복", description: "다양한 질문에 대해 즉흥적으로 답변하는 연습 필요" }
    ]
});

let mockStudentDetailData: { [key: string]: StudentDetail } = {
    '1': {
        id: '1',
        name: '김민호',
        major: '자동차 공학',
        report: createMockReport(78, '김민호')
    },
    '2': {
        id: '2',
        name: '박지윤',
        major: '호텔 경영',
        report: createMockReport(85, '박지윤')
    },
    '3': {
        id: '3',
        name: '이서준',
        major: '컴퓨터 디자인',
        // Initially empty report for the demo user
    },
    '4': {
        id: '4',
        name: '최혜원',
        major: '조리 과학',
        report: createMockReport(92, '최혜원')
    }
};

export const saveInterviewReportForStudent = (studentId: string, report: InterviewReport) => {
    const studentSummary = mockStudentList.find(s => s.id === studentId);
    const studentDetail = mockStudentDetailData[studentId];

    if (studentSummary && studentDetail) {
        const newOverallScore = report.totalScore * 10; // Convert 0-10 to 0-100
        const oldScore = studentSummary.latestScore;
        const improvement = oldScore > 0 ? Math.round(((newOverallScore - oldScore) / oldScore) * 100) : 0;
        
        studentSummary.latestScore = Math.round(newOverallScore);
        studentSummary.improvement = isFinite(improvement) ? improvement : 0;
        studentSummary.completed = true;

        studentDetail.report = report;
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
