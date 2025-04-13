
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Quiz, QuizQuestion, QuizAttempt } from "@/types/quiz";
import { useAuth } from "./AuthContext";

interface QuizContextType {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  createQuiz: (quiz: Omit<Quiz, "id" | "createdAt" | "code">) => Promise<void>;
  updateQuiz: (id: string, updates: Partial<Quiz>) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  getQuizByCode: (code: string) => Promise<Quiz | undefined>;
  startQuizAttempt: (quizId: string, studentId: string, studentName: string) => Promise<string>;
  submitQuizAttempt: (
    attemptId: string,
    answers: { questionId: string; selectedOption: number }[]
  ) => Promise<void>;
  getStudentAttempts: (studentId: string) => Promise<QuizAttempt[]>;
  getQuizAttempts: (quizId: string) => Promise<QuizAttempt[]>;
  generateQuizCode: () => string;
  fetchQuizzes: () => Promise<void>;
  fetchAttempts: () => Promise<void>;
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

export const QuizProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch quizzes from Supabase
  const fetchQuizzes = async () => {
    if (!user) return;

    try {
      let query;
      if (user.role === 'teacher') {
        // Teachers see all their quizzes
        query = supabase
          .from('quizzes')
          .select(`
            id, 
            title, 
            description, 
            created_by, 
            created_at, 
            code, 
            is_published,
            questions (
              id, 
              text, 
              options, 
              correct_answer
            )
          `)
          .eq('created_by', user.id);
      } else {
        // Students see only published quizzes
        query = supabase
          .from('quizzes')
          .select(`
            id, 
            title, 
            description, 
            created_by, 
            created_at, 
            code, 
            is_published,
            questions (
              id, 
              text, 
              options, 
              correct_answer
            )
          `)
          .eq('is_published', true);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        // Transform the data to match our expected format
        const transformedQuizzes: Quiz[] = data.map((quiz: any) => ({
          id: quiz.id,
          title: quiz.title,
          description: quiz.description || "",
          createdBy: quiz.created_by,
          createdAt: quiz.created_at,
          code: quiz.code,
          isPublished: quiz.is_published,
          questions: quiz.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correctAnswer: q.correct_answer
          }))
        }));

        setQuizzes(transformedQuizzes);
      }
    } catch (error: any) {
      console.error('Error fetching quizzes:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quizzes.",
        variant: "destructive",
      });
    }
  };

  // Fetch attempts from Supabase
  const fetchAttempts = async () => {
    if (!user) return;

    try {
      let query;
      if (user.role === 'teacher') {
        // Teachers can see attempts for their quizzes
        query = supabase
          .from('attempts')
          .select(`
            id,
            quiz_id,
            student_id,
            started_at,
            completed_at,
            answers,
            score,
            profiles:student_id (name)
          `)
          .in('quiz_id', quizzes.map(q => q.id));
      } else {
        // Students can see only their attempts
        query = supabase
          .from('attempts')
          .select(`
            id,
            quiz_id,
            student_id,
            started_at,
            completed_at,
            answers,
            score,
            profiles:student_id (name)
          `)
          .eq('student_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      if (data) {
        const transformedAttempts: QuizAttempt[] = data.map((a: any) => ({
          id: a.id,
          quizId: a.quiz_id,
          studentId: a.student_id,
          studentName: a.profiles?.name || "Unknown Student",
          startedAt: a.started_at,
          completedAt: a.completed_at,
          answers: a.answers || [],
          score: a.score
        }));

        setAttempts(transformedAttempts);
      }
    } catch (error: any) {
      console.error('Error fetching attempts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch quiz attempts.",
        variant: "destructive",
      });
    }
  };

  // Load data when component mounts or user changes
  useEffect(() => {
    if (user) {
      fetchQuizzes();
    }
  }, [user]);

  useEffect(() => {
    if (quizzes.length > 0 && user) {
      fetchAttempts();
    }
  }, [quizzes, user]);

  const createQuiz = async (quizData: Omit<Quiz, "id" | "createdAt" | "code">) => {
    if (!user || user.role !== 'teacher') {
      toast({
        title: "Permission Denied",
        description: "Only teachers can create quizzes.",
        variant: "destructive",
      });
      return;
    }

    try {
      const code = generateCode();
      
      // First, insert the quiz
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert({
          title: quizData.title,
          description: quizData.description,
          created_by: user.id,
          code: code,
          is_published: quizData.isPublished
        })
        .select('id')
        .single();

      if (quizError) throw quizError;
      
      // Then, insert the questions
      const questionsToInsert = quizData.questions.map((question: QuizQuestion) => ({
        quiz_id: quizData.id,
        text: question.text,
        options: question.options,
        correct_answer: question.correctAnswer
      }));
      
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);
        
      if (questionsError) throw questionsError;
      
      // Fetch the updated quiz list
      await fetchQuizzes();
      
      toast({
        title: "Quiz Created",
        description: `Quiz "${quizData.title}" has been created with code ${code}`,
      });
    } catch (error: any) {
      console.error('Error creating quiz:', error);
      toast({
        title: "Error",
        description: "Failed to create quiz.",
        variant: "destructive",
      });
    }
  };

  const updateQuiz = async (id: string, updates: Partial<Quiz>) => {
    if (!user || user.role !== 'teacher') return;
    
    try {
      // Update quiz base data
      const quizUpdates: any = {};
      if (updates.title !== undefined) quizUpdates.title = updates.title;
      if (updates.description !== undefined) quizUpdates.description = updates.description;
      if (updates.isPublished !== undefined) quizUpdates.is_published = updates.isPublished;
      
      if (Object.keys(quizUpdates).length > 0) {
        const { error: quizError } = await supabase
          .from('quizzes')
          .update(quizUpdates)
          .eq('id', id);
          
        if (quizError) throw quizError;
      }
      
      // If questions were updated, handle them
      if (updates.questions) {
        // Delete existing questions
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .eq('quiz_id', id);
          
        if (deleteError) throw deleteError;
        
        // Insert new questions
        const questionsToInsert = updates.questions.map(q => ({
          quiz_id: id,
          text: q.text,
          options: q.options,
          correct_answer: q.correctAnswer
        }));
        
        const { error: insertError } = await supabase
          .from('questions')
          .insert(questionsToInsert);
          
        if (insertError) throw insertError;
      }
      
      // Refresh quizzes
      await fetchQuizzes();
      
      toast({
        title: "Quiz Updated",
        description: "The quiz has been successfully updated.",
      });
    } catch (error: any) {
      console.error('Error updating quiz:', error);
      toast({
        title: "Error",
        description: "Failed to update quiz.",
        variant: "destructive",
      });
    }
  };

  const deleteQuiz = async (id: string) => {
    if (!user || user.role !== 'teacher') return;
    
    try {
      const { error } = await supabase
        .from('quizzes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update state
      setQuizzes(prev => prev.filter(quiz => quiz.id !== id));
      
      toast({
        title: "Quiz Deleted",
        description: "The quiz has been permanently deleted.",
      });
    } catch (error: any) {
      console.error('Error deleting quiz:', error);
      toast({
        title: "Error",
        description: "Failed to delete quiz.",
        variant: "destructive",
      });
    }
  };

  const getQuizByCode = async (code: string): Promise<Quiz | undefined> => {
    try {
      const { data, error } = await supabase
        .from('quizzes')
        .select(`
          id, 
          title, 
          description, 
          created_by, 
          created_at, 
          code, 
          is_published,
          questions (
            id, 
            text, 
            options, 
            correct_answer
          )
        `)
        .eq('code', code.toUpperCase())
        .eq('is_published', true)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          // No rows found, not an error
          return undefined;
        }
        throw error;
      }
      
      if (data) {
        return {
          id: data.id,
          title: data.title,
          description: data.description || "",
          createdBy: data.created_by,
          createdAt: data.created_at,
          code: data.code,
          isPublished: data.is_published,
          questions: data.questions.map((q: any) => ({
            id: q.id,
            text: q.text,
            options: q.options,
            correctAnswer: q.correct_answer
          }))
        };
      }
      
      return undefined;
    } catch (error) {
      console.error('Error fetching quiz by code:', error);
      return undefined;
    }
  };

  const startQuizAttempt = async (quizId: string, studentId: string, studentName: string): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('attempts')
        .insert({
          quiz_id: quizId,
          student_id: studentId,
        })
        .select('id')
        .single();
        
      if (error) throw error;
      
      const attemptId = data.id;
      
      // Refresh attempts
      await fetchAttempts();
      
      return attemptId;
    } catch (error: any) {
      console.error('Error starting quiz attempt:', error);
      toast({
        title: "Error",
        description: "Failed to start quiz attempt.",
        variant: "destructive",
      });
      throw error;
    }
  };

  const submitQuizAttempt = async (
    attemptId: string,
    answers: { questionId: string; selectedOption: number }[]
  ) => {
    try {
      // First get the attempt to find the quiz ID
      const { data: attemptData, error: attemptError } = await supabase
        .from('attempts')
        .select('quiz_id')
        .eq('id', attemptId)
        .single();
        
      if (attemptError) throw attemptError;
      
      // Then get the quiz questions to calculate score
      const { data: quizData, error: quizError } = await supabase
        .from('questions')
        .select('id, correct_answer')
        .eq('quiz_id', attemptData.quiz_id);
        
      if (quizError) throw quizError;
      
      // Calculate score
      let correctAnswers = 0;
      answers.forEach(answer => {
        const question = quizData.find((q: any) => q.id === answer.questionId);
        if (question && question.correct_answer === answer.selectedOption) {
          correctAnswers++;
        }
      });
      
      const score = quizData.length > 0
        ? Math.round((correctAnswers / quizData.length) * 100)
        : 0;
      
      // Update the attempt with answers and score
      const { error: updateError } = await supabase
        .from('attempts')
        .update({
          answers: answers,
          score: score,
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId);
        
      if (updateError) throw updateError;
      
      // Refresh attempts
      await fetchAttempts();
      
      toast({
        title: "Quiz Submitted",
        description: "Your answers have been submitted successfully.",
      });
    } catch (error: any) {
      console.error('Error submitting quiz attempt:', error);
      toast({
        title: "Error",
        description: "Failed to submit quiz.",
        variant: "destructive",
      });
    }
  };

  const getStudentAttempts = async (studentId: string): Promise<QuizAttempt[]> => {
    return attempts.filter(a => a.studentId === studentId);
  };

  const getQuizAttempts = async (quizId: string): Promise<QuizAttempt[]> => {
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
        fetchQuizzes,
        fetchAttempts
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
