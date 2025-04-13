
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz, QuizQuestion } from "@/context/QuizContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ArrowLeft, ArrowRight, CheckCircle, AlertCircle, Timer, HelpCircle } from "lucide-react";

const QuizTaker = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { attempts, quizzes, submitQuizAttempt } = useQuiz();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showTimeWarning, setShowTimeWarning] = useState(false);

  // Get the current attempt and quiz
  const attempt = attempts.find(a => a.id === attemptId);
  const quiz = attempt ? quizzes.find(q => q.id === attempt.quizId) : null;
  const questions = quiz?.questions || [];

  useEffect(() => {
    if (!attempt || !quiz) {
      toast({
        title: "Error",
        description: "Quiz attempt not found",
        variant: "destructive",
      });
      navigate("/student-dashboard");
      return;
    }

    if (attempt.completedAt) {
      toast({
        title: "Quiz Already Completed",
        description: "You have already completed this quiz",
      });
      navigate(`/attempt-results/${attemptId}`);
      return;
    }

    // Simple timer for demonstration (30 minutes)
    const timeLimit = 30 * 60;
    const startTime = new Date(attempt.startedAt).getTime();
    const now = new Date().getTime();
    const elapsedSeconds = Math.floor((now - startTime) / 1000);
    const remaining = Math.max(0, timeLimit - elapsedSeconds);
    
    setTimeRemaining(remaining);

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null) return null;
        
        const newTime = prev - 1;
        
        // Show warning when 5 minutes remaining
        if (newTime === 300) {
          setShowTimeWarning(true);
          toast({
            title: "Time Running Out",
            description: "You have 5 minutes remaining to complete the quiz",
            variant: "destructive",
          });
        }
        
        // Auto-submit when time runs out
        if (newTime <= 0) {
          clearInterval(timer);
          handleSubmitQuiz();
          return 0;
        }
        
        return newTime;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, quiz, attemptId, navigate, toast]);

  const handleSelectAnswer = (questionId: string, optionIndex: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitQuiz = async () => {
    if (!attempt) return;
    
    setIsSubmitting(true);
    
    try {
      // Prepare answers in the required format
      const formattedAnswers = Object.entries(selectedAnswers).map(([questionId, selectedOption]) => ({
        questionId,
        selectedOption,
      }));
      
      // Submit the quiz
      submitQuizAttempt(attempt.id, formattedAnswers);
      
      toast({
        title: "Quiz Submitted",
        description: "Your answers have been submitted successfully",
      });
      
      // Navigate to results page
      navigate(`/attempt-results/${attemptId}`);
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "There was a problem submitting your quiz. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredQuestionsCount = Object.keys(selectedAnswers).length;
  const currentQuestion = questions[currentQuestionIndex] as QuizQuestion | undefined;
  const progress = questions.length > 0 
    ? Math.round((answeredQuestionsCount / questions.length) * 100) 
    : 0;

  if (!attempt || !quiz || !currentQuestion) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading quiz...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{quiz.title}</h1>
          <p className="text-muted-foreground">{quiz.description}</p>
        </div>
        
        {timeRemaining !== null && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-md ${
            timeRemaining < 300 ? "bg-destructive/10 text-destructive" : "bg-muted"
          }`}>
            <Timer className="h-5 w-5" />
            <span className="font-mono font-medium">{formatTime(timeRemaining)}</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Progress value={progress} className="w-32" />
          <span className="text-sm text-muted-foreground">
            {answeredQuestionsCount}/{questions.length} answered
          </span>
        </div>
        
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {questions.length}
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-start gap-2">
            <div className="flex items-center justify-center rounded-full bg-primary/10 p-1 h-6 w-6 text-xs text-primary font-medium">
              {currentQuestionIndex + 1}
            </div>
            <CardTitle>{currentQuestion.text}</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <RadioGroup 
            onValueChange={(value) => handleSelectAnswer(currentQuestion.id, parseInt(value))}
            value={selectedAnswers[currentQuestion.id]?.toString() || ""}
            className="space-y-3"
          >
            {currentQuestion.options.map((option, idx) => (
              <div key={idx} className="flex items-start space-x-2 border rounded-md p-3 hover:bg-muted/50 transition-colors">
                <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                <Label htmlFor={`option-${idx}`} className="font-normal flex-1 cursor-pointer">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevious} 
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Previous
          </Button>
          
          {currentQuestionIndex < questions.length - 1 ? (
            <Button onClick={handleNext}>
              Next <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button>
                  Submit Quiz <CheckCircle className="ml-2 h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure you want to submit?</AlertDialogTitle>
                  <AlertDialogDescription>
                    {answeredQuestionsCount < questions.length ? (
                      <div className="flex items-center gap-2 text-warning">
                        <AlertCircle className="h-5 w-5 text-destructive" />
                        <span>
                          You have only answered {answeredQuestionsCount} out of {questions.length} questions.
                        </span>
                      </div>
                    ) : (
                      <span>
                        You've answered all questions. Once submitted, you cannot change your answers.
                      </span>
                    )}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleSubmitQuiz}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Submitting..." : "Submit Quiz"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </CardFooter>
      </Card>
      
      <div className="flex flex-wrap gap-2 justify-center">
        {questions.map((_, idx) => (
          <Button
            key={idx}
            variant={idx === currentQuestionIndex ? "default" : selectedAnswers[questions[idx].id] !== undefined ? "outline" : "ghost"}
            size="sm"
            className="w-10 h-10 p-0"
            onClick={() => setCurrentQuestionIndex(idx)}
          >
            {idx + 1}
          </Button>
        ))}
      </div>
      
      {showTimeWarning && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-5 w-5 text-destructive" />
              <p className="font-medium text-destructive">Time is running out! Please finish your quiz.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default QuizTaker;
