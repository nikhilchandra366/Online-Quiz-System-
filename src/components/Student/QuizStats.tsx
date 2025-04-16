
import React from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { BookOpen, Clock, Award } from "lucide-react";
import { Quiz, QuizAttempt } from "@/types/quiz";

interface QuizStatsProps {
  quizzes: Quiz[];
  inProgressAttempts: QuizAttempt[];
  completedAttempts: QuizAttempt[];
}

const QuizStats: React.FC<QuizStatsProps> = ({
  quizzes,
  inProgressAttempts,
  completedAttempts,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <CardTitle>Available Quizzes</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{quizzes.filter(q => q.isPublished).length}</p>
          <p className="text-sm text-muted-foreground">Enter a quiz code to start</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <CardTitle>In Progress</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{inProgressAttempts.length}</p>
          <p className="text-sm text-muted-foreground">Quizzes you've started</p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Award className="h-5 w-5 text-primary" />
            <CardTitle>Completed</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">{completedAttempts.length}</p>
          <p className="text-sm text-muted-foreground">Quizzes you've finished</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizStats;
