
import { User } from '@supabase/supabase-js';

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

export type UserRole = "teacher" | "student";

export interface AppUser extends User {
  role?: UserRole;
  name?: string;
}
