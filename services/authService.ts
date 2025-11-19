
import { User, School } from '../types';

// Mock Data - Iksan Region Schools
const MOCK_SCHOOLS: School[] = [
    { id: 'iksan-tech', name: '이리공업고등학교' },
    { id: 'jeonbuk-mech', name: '전북기계공업고등학교' },
    { id: 'wonkwang-info', name: '원광정보예술고등학교' },
    { id: 'jinkyeong-girls', name: '진경여자고등학교' },
    { id: 'iksan-high', name: '이리고등학교' },
];

// Mock Users Database
const MOCK_USERS: User[] = [
    { 
        id: 'u1', 
        name: '김교사', 
        email: 'teacher@elice.io', 
        role: 'teacher', 
        schoolId: 'iksan-tech', 
        schoolName: '이리공업고등학교',
        grade: 3, // Teacher is in charge of 3rd grade
        className: '3학년 담당'
    },
    { 
        id: 'u2', 
        name: '이학생', 
        email: 'student@elice.io', 
        role: 'student', 
        schoolId: 'iksan-tech', 
        schoolName: '이리공업고등학교',
        grade: 3,
        classNumber: 2,
        className: '3학년 2반'
    }
];

export const getSchools = async (): Promise<School[]> => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return MOCK_SCHOOLS;
};

export const signIn = async (email: string): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Find existing mock user
    const user = MOCK_USERS.find(u => u.email === email);
    if (user) return user;

    // Fallback for demo purposes if email doesn't match mock data
    // Create a transient user based on email pattern
    const role = email.includes('teacher') ? 'teacher' : 'student';
    const name = email.split('@')[0];
    
    return {
        id: `temp-${Date.now()}`,
        name: name,
        email: email,
        role: role,
        schoolId: 'iksan-tech',
        schoolName: '이리공업고등학교',
        grade: 3,
        classNumber: role === 'student' ? 1 : undefined,
        className: role === 'student' ? '3학년 1반' : '3학년 담당'
    };
};

export const signUp = async (
    name: string, 
    email: string, 
    role: 'student' | 'teacher', 
    schoolId: string, 
    grade: number,
    classNumber?: number
): Promise<User> => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const school = MOCK_SCHOOLS.find(s => s.id === schoolId);
    const className = classNumber ? `${grade}학년 ${classNumber}반` : `${grade}학년 담당`;

    const newUser: User = {
        id: `u-${Date.now()}`,
        name,
        email,
        role,
        schoolId,
        schoolName: school?.name,
        grade,
        classNumber,
        className
    };
    
    // In a real app, we would add to MOCK_USERS or backend
    MOCK_USERS.push(newUser);
    
    return newUser;
};
