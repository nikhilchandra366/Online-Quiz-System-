import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { useQuiz } from "@/context/QuizContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Clock, Award, ArrowRight, CheckCircle } from "lucide-react";

const StudentDashboard = () => {
  const [quizCode, setQuizCode] = useState("");
  const { user } = useAuth();
  const { getQuizByCode, attempts, quizzes } = useQuiz();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Handle quiz code submission
  const handleSubmitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!quizCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a quiz code",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const quiz = await getQuizByCode(quizCode.trim());
      
      if (quiz) {
        navigate(`/quiz/${quiz.id}`);
      } else {
        toast({
          title: "Invalid Quiz Code",
          description: "No active quiz found with this code. Please check and try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch quiz. Please try again.",
        variant: "destructive",
      });
    }
  };

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
      
      <Card>
        <CardHeader>
          <CardTitle>Enter Quiz Code</CardTitle>
          <CardDescription>Enter the code provided by your teacher to access the quiz</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitCode} className="flex gap-2">
            <Input 
              placeholder="Enter quiz code (e.g., MATH01)" 
              value={quizCode}
              onChange={(e) => setQuizCode(e.target.value.toUpperCase())}
              className="uppercase"
              maxLength={6}
            />
            <Button type="submit">Start Quiz</Button>
          </form>
        </CardContent>
      </Card>
      
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
                      <p className="text-sm text-muted-foreground truncate">{quiz?.description || "No description"}</p>
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
                      <p className="text-sm text-muted-foreground truncate">{quiz?.description || "No description"}</p>
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
    </div>
  );
};

export default StudentDashboard;
