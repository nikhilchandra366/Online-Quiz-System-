
import React from "react";
import { useAuth } from "@/context/AuthContext";
import { useQuiz } from "@/context/QuizContext";
import QuizStats from "./QuizStats";
import QuizCodeEntry from "./QuizCodeEntry";
import AttemptsList from "./AttemptsList";

const StudentDashboard = () => {
  const { user } = useAuth();
  const { attempts, quizzes } = useQuiz();

  // Get student's attempts
  const studentAttempts = attempts.filter(attempt => attempt.studentId === user?.id);
  
  // Group attempts by completed and in-progress
  const completedAttempts = studentAttempts.filter(attempt => attempt.completedAt);
  const inProgressAttempts = studentAttempts.filter(attempt => !attempt.completedAt);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome, {user?.name}!</h1>
        <p className="text-muted-foreground">Access your quizzes and see your results.</p>
      </div>
      
      <QuizStats 
        quizzes={quizzes}
        inProgressAttempts={inProgressAttempts}
        completedAttempts={completedAttempts}
      />
      
      <QuizCodeEntry />
      
      <AttemptsList 
        inProgressAttempts={inProgressAttempts}
        completedAttempts={completedAttempts}
        quizzes={quizzes}
      />
    </div>
  );
};

export default StudentDashboard;
