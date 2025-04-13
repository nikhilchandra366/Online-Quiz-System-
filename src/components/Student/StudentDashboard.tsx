
import React, { useState } from "react";
import { useQuiz } from "@/context/QuizContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Search, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const StudentDashboard: React.FC = () => {
  const [quizCode, setQuizCode] = useState("");
  const { getQuizByCode, getStudentAttempts } = useQuiz();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const attempts = user ? getStudentAttempts(user.id) : [];
  const completedAttempts = attempts.filter(a => a.completedAt !== null);
  const inProgressAttempts = attempts.filter(a => a.completedAt === null);

  const handleJoinQuiz = () => {
    if (!quizCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz code",
        variant: "destructive",
      });
      return;
    }

    const quiz = getQuizByCode(quizCode);
    if (!quiz) {
      toast({
        title: "Quiz not found",
        description: "The quiz code you entered doesn't exist or is not published.",
        variant: "destructive",
      });
      return;
    }

    // Check if there's already an in-progress attempt
    const existingAttempt = inProgressAttempts.find(a => a.quizId === quiz.id);
    if (existingAttempt) {
      navigate(`/take-quiz/${existingAttempt.id}`);
      return;
    }

    navigate(`/quiz/${quiz.id}`);
  };

  const handleContinueAttempt = (attemptId: string) => {
    navigate(`/take-quiz/${attemptId}`);
  };

  const handleViewResults = (attemptId: string) => {
    navigate(`/attempt-results/${attemptId}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Student Dashboard</h1>
        <p className="text-muted-foreground">Take quizzes and view your results</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Join a Quiz</CardTitle>
          <CardDescription>
            Enter the quiz code provided by your teacher to start taking a quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-2">
            <Input
              placeholder="Enter quiz code (e.g., ABC123)"
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="font-mono uppercase"
            />
            <Button onClick={handleJoinQuiz}>
              <Search className="h-4 w-4 mr-2" />
              Join Quiz
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="in-progress" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="in-progress">In Progress</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="in-progress">
          {inProgressAttempts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <Clock className="h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">No quizzes in progress</p>
                  <p className="text-muted-foreground">
                    Enter a quiz code above to start taking a quiz
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inProgressAttempts.map((attempt) => {
                const quiz = quizzes.find(q => q.id === attempt.quizId);
                if (!quiz) return null;
                
                return (
                  <Card key={attempt.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{quiz.title}</CardTitle>
                        <Badge variant="outline">In Progress</Badge>
                      </div>
                      <CardDescription>
                        Started on {new Date(attempt.startedAt).toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-sm text-muted-foreground">
                          <span>Questions answered: </span>
                          <span className="font-medium">
                            {attempt.answers.length}/{quiz.questions.length}
                          </span>
                        </div>
                        <Progress 
                          value={(attempt.answers.length / quiz.questions.length) * 100} 
                        />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        onClick={() => handleContinueAttempt(attempt.id)}
                      >
                        Continue Quiz
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedAttempts.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <CheckCircle2 className="h-12 w-12 text-muted-foreground" />
                  <p className="text-lg font-medium">No completed quizzes</p>
                  <p className="text-muted-foreground">
                    Your completed quizzes will appear here
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {completedAttempts.map((attempt) => {
                const quiz = quizzes.find(q => q.id === attempt.quizId);
                if (!quiz) return null;
                
                const scorePercentage = attempt.score || 0;
                
                return (
                  <Card key={attempt.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between">
                        <CardTitle>{quiz.title}</CardTitle>
                        <Badge
                          variant={scorePercentage >= 70 ? "default" : 
                                  scorePercentage >= 40 ? "secondary" : "outline"}
                        >
                          {scorePercentage}%
                        </Badge>
                      </div>
                      <CardDescription>
                        Completed on {new Date(attempt.completedAt || "").toLocaleDateString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Questions:</span>
                          <span>{quiz.questions.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Result:</span>
                          <span 
                            className={
                              scorePercentage >= 70 
                                ? "text-green-600" 
                                : scorePercentage >= 40 
                                ? "text-amber-600" 
                                : "text-red-600"
                            }
                          >
                            {scorePercentage >= 70 
                              ? "Passed" 
                              : scorePercentage >= 40 
                              ? "Average" 
                              : "Needs Improvement"}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button 
                        className="w-full" 
                        variant="outline"
                        onClick={() => handleViewResults(attempt.id)}
                      >
                        View Results
                      </Button>
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentDashboard;
