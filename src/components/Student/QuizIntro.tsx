
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz } from "@/context/QuizContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FileQuestion, Clock, ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const QuizIntro: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { quizzes, startQuizAttempt } = useQuiz();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const quiz = quizzes.find(q => q.id === quizId);

  if (!quiz) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Quiz not found. The quiz may have been deleted or the code is incorrect.</p>
      </div>
    );
  }

  const handleStartQuiz = () => {
    if (!user) {
      toast({
        title: "Authentication required",
        description: "You need to be logged in to take a quiz",
        variant: "destructive",
      });
      return;
    }

    // Create a new quiz attempt
    const attemptId = startQuizAttempt(quiz.id, user.id, user.name);
    navigate(`/take-quiz/${attemptId}`);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button 
          variant="outline" 
          size="icon" 
          onClick={() => navigate("/student-dashboard")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Quiz: {quiz.title}</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Quiz Information</CardTitle>
          <CardDescription>
            Please read the following information before starting the quiz
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-lg font-medium">Description</h3>
            <p className="text-muted-foreground">
              {quiz.description || "No description provided by the teacher."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-start space-x-2">
              <FileQuestion className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Number of Questions</h3>
                <p className="text-muted-foreground">{quiz.questions.length} questions</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Clock className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <h3 className="font-medium">Estimated Time</h3>
                <p className="text-muted-foreground">
                  {Math.max(5, Math.ceil(quiz.questions.length * 1.5))} minutes
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-md">
            <h3 className="font-medium mb-2">Instructions</h3>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Read each question carefully before answering.</li>
              <li>You can navigate between questions using the next/previous buttons.</li>
              <li>You can review your answers before submitting.</li>
              <li>Once you submit the quiz, you cannot retake it.</li>
              <li>Your results will be available immediately after submission.</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={() => navigate("/student-dashboard")}
          >
            Return to Dashboard
          </Button>
          <Button onClick={handleStartQuiz}>
            Start Quiz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default QuizIntro;
