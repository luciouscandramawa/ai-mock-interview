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

let mockStudentDetailData: { [key: string]: StudentDetail } = {
    '1': {
        id: '1',
        name: '김민호',
        major: '자동차 공학',
        progressSummary: "지난주보다 유창성이 15% 향상되었습니다. 기술적인 설명이 좋아졌으나, 답변 마무리를 더 명확하게 할 필요가 있습니다.",
        sessions: [
            { 
                question: "자동차 공학을 전공하게 된 계기는 무엇인가요?", 
                answer: "어릴 때부터 자동차가 어떻게 굴러가는지 궁금했습니다. 삼촌이 정비사셔서 많이 배웠습니다.",
                evaluation: "솔직하고 명확한 답변입니다. 다만 구체적인 에피소드를 곁들여 본인의 열정을 수치화하거나 구체화하면 더 좋겠습니다.",
                score: 8.2,
                isCorrect: true
            },
            {
                question: "인턴십 중 문제를 해결한 경험이 있나요?", 
                answer: "현대 정비소에서 일할 때 하이브리드 시스템 배선 문제가 있었습니다. 진단기를 써서 선배님과 같이 해결했습니다.",
                evaluation: "STAR 기법을 더 활용해보세요. 본인이 구체적으로 어떤 '행동'을 했는지 강조가 필요합니다.",
                score: 7.8,
                isCorrect: true
            },
        ]
    },
    '2': {
        id: '2',
        name: '박지윤',
        major: '호텔 경영',
        progressSummary: "고객 서비스 톤앤매너가 훌륭합니다. 다만 답변이 다소 짧은 경향이 있어 구조적인 스토리텔링 연습이 필요합니다.",
        sessions: [
            { 
                question: "불만 고객을 어떻게 응대하시겠습니까?", 
                answer: "우선 죄송하다고 사과드리고, 이야기를 끝까지 들어드린 뒤 할인 쿠폰 등을 제공하겠습니다.",
                evaluation: "기본적인 응대 원칙을 잘 알고 계십니다. 실제 경험이나 구체적인 상황(예: 객실 업그레이드 등)을 예시로 들면 신뢰도가 높아집니다.",
                score: 8.8,
                isCorrect: true,
            },
        ]
    },
    '3': {
        id: '3',
        name: '이서준',
        major: '컴퓨터 디자인',
        progressSummary: "디자인 의도를 말로 설명하는 데 어려움을 겪고 있습니다. STAR 기법을 활용한 말하기 연습이 시급합니다.",
        sessions: [
            { 
                question: "최근 프로젝트의 디자인 프로세스를 설명해주세요.", 
                answer: "그냥 피그마 켜서 예쁘게 만들었습니다. 색깔은 인터넷에서 찾았습니다.",
                evaluation: "너무 단답형이며 전문성이 드러나지 않습니다. 리서치 -> 와이어프레임 -> 프로토타입 -> 피드백 반영 과정을 논리적으로 설명해야 합니다.",
                score: 5.5,
                isCorrect: false,
            },
        ]
    },
    '4': {
        id: '4',
        name: '최혜원',
        major: '조리 과학',
        progressSummary: "매우 우수합니다. 조리 기술에 대한 열정이 돋보이며 답변의 구조도 탄탄합니다.",
        sessions: [
            { 
                question: "가장 자신 있는 요리는 무엇인가요?", 
                answer: "저는 묵은지 김치찌개에 자신 있습니다. 훈연 멸치 육수를 사용하여 감칠맛을 20% 이상 끌어올린 저만의 레시피가 있습니다.",
                evaluation: "수치(20% 이상)를 활용하여 성과를 구체화한 점이 매우 훌륭합니다. 자신감이 느껴지는 답변입니다.",
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
        const newOverallScore = report.totalScore * 10; // Convert 0-10 to 0-100
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
        studentDetail.progressSummary = `${report.summary.strengths} 하지만, ${report.summary.areasForGrowth}`;
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
