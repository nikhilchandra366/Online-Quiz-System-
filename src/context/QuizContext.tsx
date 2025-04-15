import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Quiz, QuizQuestion, QuizAttempt } from "@/types/quiz";
import { useAuth } from "./AuthContext";

interface QuizContextType {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  createQuiz: (quiz: Omit<Quiz, "id" | "createdAt">) => Promise<void>;
  updateQuiz: (id: string, updates: Partial<Quiz>) => Promise<void>;
  deleteQuiz: (id: string) => Promise<void>;
  getQuizByCode: (code: string) => Promise<Quiz | undefined>;
  startQuizAttempt: (quizId: string, studentId: string, studentName: string) => Promise<string>;
  submitQuizAttempt: (
    attemptId: string,
    answers: { questionId: string; selectedOption: number }[]
  ) => Promise<void>;
  getStudentAttempts: (studentId: string) => QuizAttempt[];
  getQuizAttempts: (quizId: string) => QuizAttempt[];
  generateQuizCode: () => string;
  fetchQuizzes: () => Promise<void>;
  fetchAttempts: () => Promise<void>;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

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

  const fetchQuizzes = async () => {
    if (!user) {
      console.log("QuizContext: No user, skipping quiz fetch");
      return;
    }

    try {
      console.log("QuizContext: Fetching quizzes for user", user.id, "with role", user.role);
      let query;
      if (user.role === 'teacher') {
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
        console.error('Error fetching quizzes:', error);
        throw error;
      }

      if (data) {
        console.log("QuizContext: Received quiz data", data);
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
        console.log("QuizContext: Transformed quizzes set", transformedQuizzes);
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

  const fetchAttempts = async () => {
    if (!user) return;

    try {
      let query;
      if (user.role === 'teacher') {
        query = supabase
          .from('attempts')
          .select(`
            id,
            quiz_id,
            student_id,
            started_at,
            completed_at,
            answers,
            score
          `)
          .in('quiz_id', quizzes.map(q => q.id));
      } else {
        query = supabase
          .from('attempts')
          .select(`
            id,
            quiz_id,
            student_id,
            started_at,
            completed_at,
            answers,
            score
          `)
          .eq('student_id', user.id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching attempts:', error);
        throw error;
      }

      if (data) {
        const transformedAttempts: QuizAttempt[] = data.map((a: any) => ({
          id: a.id,
          quizId: a.quiz_id,
          studentId: a.student_id,
          studentName: "Student",
          startedAt: a.started_at,
          completedAt: a.completed_at,
          answers: a.answers || [],
          score: a.score
        }));

        setAttempts(transformedAttempts);
        console.log("QuizContext: Attempts fetched and transformed", transformedAttempts);
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

  useEffect(() => {
    if (user) {
      console.log("QuizContext: User changed, fetching quizzes", user);
      fetchQuizzes();
    } else {
      console.log("QuizContext: No user available, clearing quizzes");
      setQuizzes([]);
      setAttempts([]);
    }
  }, [user]);

  useEffect(() => {
    if (quizzes.length > 0 && user) {
      console.log("QuizContext: Quizzes loaded, fetching attempts");
      fetchAttempts();
    }
  }, [quizzes, user]);

  const createQuiz = async (quizData: Omit<Quiz, "id" | "createdAt">) => {
    if (!user || user.role !== 'teacher') {
      toast({
        title: "Permission Denied",
        description: "Only teachers can create quizzes.",
        variant: "destructive",
      });
      return;
    }

    try {
      const code = quizData.code || generateCode();
      
      const { data: insertedQuiz, error: quizError } = await supabase
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
      
      const questionsToInsert = quizData.questions.map((question: QuizQuestion) => ({
        quiz_id: insertedQuiz.id,
        text: question.text,
        options: question.options,
        correct_answer: question.correctAnswer
      }));
      
      const { error: questionsError } = await supabase
        .from('questions')
        .insert(questionsToInsert);
        
      if (questionsError) throw questionsError;
      
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
      
      if (updates.questions) {
        const { error: deleteError } = await supabase
          .from('questions')
          .delete()
          .eq('quiz_id', id);
          
        if (deleteError) throw deleteError;
        
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
      const { data: attemptData, error: attemptError } = await supabase
        .from('attempts')
        .select('quiz_id')
        .eq('id', attemptId)
        .single();
        
      if (attemptError) throw attemptError;
      
      const { data: quizData, error: quizError } = await supabase
        .from('questions')
        .select('id, correct_answer')
        .eq('quiz_id', attemptData.quiz_id);
        
      if (quizError) throw quizError;
      
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
      
      const { error: updateError } = await supabase
        .from('attempts')
        .update({
          answers: answers,
          score: score,
          completed_at: new Date().toISOString()
        })
        .eq('id', attemptId);
        
      if (updateError) throw updateError;
      
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

  const getStudentAttempts = (studentId: string): QuizAttempt[] => {
    return attempts.filter(a => a.studentId === studentId);
  };

  const getQuizAttempts = (quizId: string): QuizAttempt[] => {
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
