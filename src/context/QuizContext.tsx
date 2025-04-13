
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  createdBy: string;
  createdAt: string;
  code: string;
  questions: QuizQuestion[];
  isPublished: boolean;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  studentId: string;
  studentName: string;
  startedAt: string;
  completedAt: string | null;
  answers: { questionId: string; selectedOption: number }[];
  score: number | null;
}

interface QuizContextType {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  createQuiz: (quiz: Omit<Quiz, "id" | "createdAt" | "code">) => void;
  updateQuiz: (id: string, updates: Partial<Quiz>) => void;
  deleteQuiz: (id: string) => void;
  getQuizByCode: (code: string) => Quiz | undefined;
  startQuizAttempt: (quizId: string, studentId: string, studentName: string) => string;
  submitQuizAttempt: (
    attemptId: string,
    answers: { questionId: string; selectedOption: number }[]
  ) => void;
  getStudentAttempts: (studentId: string) => QuizAttempt[];
  getQuizAttempts: (quizId: string) => QuizAttempt[];
  generateQuizCode: () => string;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

// Generate a random quiz code
const generateCode = () => {
  const characters = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return result;
};

// Calculate score based on answers and quiz questions
const calculateScore = (
  answers: { questionId: string; selectedOption: number }[],
  questions: QuizQuestion[]
): number => {
  let correctAnswers = 0;
  
  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question && question.correctAnswer === answer.selectedOption) {
      correctAnswers++;
    }
  });
  
  return questions.length > 0
    ? Math.round((correctAnswers / questions.length) * 100)
    : 0;
};

// Sample quizzes for demonstration
const SAMPLE_QUIZZES: Quiz[] = [
  {
    id: "1",
    title: "Math Basics",
    description: "Test your knowledge of basic mathematics concepts",
    createdBy: "1", // Teacher id
    createdAt: new Date().toISOString(),
    code: "MATH01",
    isPublished: true,
    questions: [
      {
        id: "q1",
        text: "What is 2 + 2?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 1,
      },
      {
        id: "q2",
        text: "What is 10 - 5?",
        options: ["3", "4", "5", "6"],
        correctAnswer: 2,
      },
    ],
  },
  {
    id: "2",
    title: "Science Quiz",
    description: "Basic science concepts test",
    createdBy: "1", // Teacher id
    createdAt: new Date().toISOString(),
    code: "SCI001",
    isPublished: true,
    questions: [
      {
        id: "q1",
        text: "What is the chemical symbol for water?",
        options: ["W", "H2O", "WTR", "O2H"],
        correctAnswer: 1,
      },
      {
        id: "q2",
        text: "Which planet is closest to the Sun?",
        options: ["Earth", "Venus", "Mercury", "Mars"],
        correctAnswer: 2,
      },
    ],
  },
];

// Sample attempts
const SAMPLE_ATTEMPTS: QuizAttempt[] = [
  {
    id: "a1",
    quizId: "1",
    studentId: "2",
    studentName: "Student Demo",
    startedAt: new Date(Date.now() - 3600000).toISOString(),
    completedAt: new Date().toISOString(),
    answers: [
      { questionId: "q1", selectedOption: 1 },
      { questionId: "q2", selectedOption: 2 },
    ],
    score: 100,
  },
];

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Load from localStorage or use samples
    const storedQuizzes = localStorage.getItem("quizzes");
    const storedAttempts = localStorage.getItem("quizAttempts");
    
    if (storedQuizzes) {
      setQuizzes(JSON.parse(storedQuizzes));
    } else {
      setQuizzes(SAMPLE_QUIZZES);
      localStorage.setItem("quizzes", JSON.stringify(SAMPLE_QUIZZES));
    }
    
    if (storedAttempts) {
      setAttempts(JSON.parse(storedAttempts));
    } else {
      setAttempts(SAMPLE_ATTEMPTS);
      localStorage.setItem("quizAttempts", JSON.stringify(SAMPLE_ATTEMPTS));
    }
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("quizzes", JSON.stringify(quizzes));
  }, [quizzes]);

  useEffect(() => {
    localStorage.setItem("quizAttempts", JSON.stringify(attempts));
  }, [attempts]);

  const createQuiz = (quizData: Omit<Quiz, "id" | "createdAt" | "code">) => {
    const newQuiz: Quiz = {
      ...quizData,
      id: Math.random().toString(36).substring(2, 9),
      createdAt: new Date().toISOString(),
      code: generateCode(),
    };
    
    setQuizzes(prev => [...prev, newQuiz]);
    toast({
      title: "Quiz Created",
      description: `Quiz "${newQuiz.title}" has been created with code ${newQuiz.code}`,
    });
  };

  const updateQuiz = (id: string, updates: Partial<Quiz>) => {
    setQuizzes(prev =>
      prev.map(quiz => (quiz.id === id ? { ...quiz, ...updates } : quiz))
    );
    toast({
      title: "Quiz Updated",
      description: "The quiz has been successfully updated.",
    });
  };

  const deleteQuiz = (id: string) => {
    setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
    toast({
      title: "Quiz Deleted",
      description: "The quiz has been permanently deleted.",
    });
  };

  const getQuizByCode = (code: string) => {
    return quizzes.find(q => q.code.toUpperCase() === code.toUpperCase() && q.isPublished);
  };

  const startQuizAttempt = (quizId: string, studentId: string, studentName: string) => {
    const attemptId = Math.random().toString(36).substring(2, 9);
    const newAttempt: QuizAttempt = {
      id: attemptId,
      quizId,
      studentId,
      studentName,
      startedAt: new Date().toISOString(),
      completedAt: null,
      answers: [],
      score: null,
    };
    
    setAttempts(prev => [...prev, newAttempt]);
    return attemptId;
  };

  const submitQuizAttempt = (
    attemptId: string,
    answers: { questionId: string; selectedOption: number }[]
  ) => {
    setAttempts(prev =>
      prev.map(attempt => {
        if (attempt.id === attemptId) {
          const quiz = quizzes.find(q => q.id === attempt.quizId);
          const score = quiz ? calculateScore(answers, quiz.questions) : 0;
          
          return {
            ...attempt,
            answers,
            completedAt: new Date().toISOString(),
            score,
          };
        }
        return attempt;
      })
    );
    
    toast({
      title: "Quiz Submitted",
      description: "Your answers have been submitted successfully.",
    });
  };

  const getStudentAttempts = (studentId: string) => {
    return attempts.filter(a => a.studentId === studentId);
  };

  const getQuizAttempts = (quizId: string) => {
    return attempts.filter(a => a.quizId === quizId);
  };

  const generateQuizCode = () => {
    return generateCode();
  };

  return (
    <QuizContext.Provider
      value={{
        quizzes,
        attempts,
        createQuiz,
        updateQuiz,
        deleteQuiz,
        getQuizByCode,
        startQuizAttempt,
        submitQuizAttempt,
        getStudentAttempts,
        getQuizAttempts,
        generateQuizCode,
      }}
    >
      {children}
    </QuizContext.Provider>
  );
};

export const useQuiz = () => {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
};
