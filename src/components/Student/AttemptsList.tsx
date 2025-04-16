
import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, CheckCircle } from "lucide-react";
import { Quiz, QuizAttempt } from "@/types/quiz";

interface AttemptsListProps {
  inProgressAttempts: QuizAttempt[];
  completedAttempts: QuizAttempt[];
  quizzes: Quiz[];
}

const AttemptsList: React.FC<AttemptsListProps> = ({
  inProgressAttempts,
  completedAttempts,
  quizzes,
}) => {
  const navigate = useNavigate();

  return (
    <Tabs defaultValue="in-progress" className="w-full">
      <TabsList className="grid grid-cols-2 mb-4">
        <TabsTrigger value="in-progress">In Progress</TabsTrigger>
        <TabsTrigger value="completed">Completed</TabsTrigger>
      </TabsList>
      
      <TabsContent value="in-progress">
        {inProgressAttempts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {inProgressAttempts.map(attempt => {
              const quiz = quizzes.find(q => q.id === attempt.quizId);
              return (
                <Card key={attempt.id}>
                  <CardHeader className="pb-3">
                    <CardTitle className="truncate">{quiz?.title || "Untitled Quiz"}</CardTitle>
                    <CardDescription>
                      Started {new Date(attempt.startedAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground truncate">
                      {quiz?.description || "No description"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      onClick={() => navigate(`/take-quiz/${attempt.id}`)}
                    >
                      Continue <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No quizzes in progress</p>
          </div>
        )}
      </TabsContent>
      
      <TabsContent value="completed">
        {completedAttempts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedAttempts.map(attempt => {
              const quiz = quizzes.find(q => q.id === attempt.quizId);
              return (
                <Card key={attempt.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="truncate">{quiz?.title || "Untitled Quiz"}</CardTitle>
                      <div className="flex items-center gap-1 text-primary">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-bold">{attempt.score}%</span>
                      </div>
                    </div>
                    <CardDescription>
                      Completed {new Date(attempt.completedAt!).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground truncate">
                      {quiz?.description || "No description"}
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button 
                      className="w-full" 
                      variant="outline"
                      onClick={() => navigate(`/attempt-results/${attempt.id}`)}
                    >
                      View Results <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No completed quizzes</p>
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default AttemptsList;
