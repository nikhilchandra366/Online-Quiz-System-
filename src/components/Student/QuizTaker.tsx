
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz } from "@/context/QuizContext";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, AlertTriangle, ArrowLeft, ArrowRight, Timer, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

const QuizTaker: React.FC = () => {
  const { quizId, attemptId } = useParams<{ quizId?: string; attemptId?: string }>();
  const { quizzes, getQuizByCode, startQuizAttempt, submitQuizAttempt, attempts } = useQuiz();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
  const [timeSpent, setTimeSpent] = useState(0);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [quiz, setQuiz] = useState<typeof quizzes[0] | null>(null);
  const [attempt, setAttempt] = useState<typeof attempts[0] | null>(null);

  // Find the quiz and attempt data
  useEffect(() => {
    // If using an existing attempt
    if (attemptId) {
      const foundAttempt = attempts.find(a => a.id === attemptId);
      if (foundAttempt) {
        setAttempt(foundAttempt);
        const foundQuiz = quizzes.find(q => q.id === foundAttempt.quizId);
        if (foundQuiz) {
          setQuiz(foundQuiz);
          
          // Initialize selected options from existing answers
          const options = new Array(foundQuiz.questions.length).fill(-1);
          foundAttempt.answers.forEach(answer => {
            const questionIndex = foundQuiz.questions.findIndex(q => q.id === answer.questionId);
            if (questionIndex !== -1) {
              options[questionIndex] = answer.selectedOption;
            }
          });
          setSelectedOptions(options);
        }
      }
    } 
    // If starting a new quiz
    else if (quizId) {
      const foundQuiz = quizzes.find(q => q.id === quizId);
      if (foundQuiz) {
        setQuiz(foundQuiz);
        setSelectedOptions(new Array(foundQuiz.questions.length).fill(-1));
        
        // Start a new attempt
        if (user) {
          const newAttemptId = startQuizAttempt(foundQuiz.id, user.id, user.name);
          const newAttempt = attempts.find(a => a.id === newAttemptId);
          if (newAttempt) {
            setAttempt(newAttempt);
            navigate(`/take-quiz/${newAttemptId}`);
          }
        }
      }
    }
  }, [quizId, attemptId, quizzes, attempts, startQuizAttempt, user, navigate]);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeSpent(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  if (!quiz || !attempt) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading quiz...</p>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  const progress = selectedOptions.filter(opt => opt !== -1).length / quiz.questions.length * 100;
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleOptionSelect = (optionIndex: number) => {
    const newSelectedOptions = [...selectedOptions];
    newSelectedOptions[currentQuestionIndex] = optionIndex;
    setSelectedOptions(newSelectedOptions);
    
    // Update the attempt with the new answer
    const updatedAnswers = [
      ...attempt.answers.filter(a => a.questionId !== currentQuestion.id),
      { questionId: currentQuestion.id, selectedOption: optionIndex }
    ];
    
    submitQuizAttempt(attempt.id, updatedAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmitQuiz = () => {
    // Check if all questions have been answered
    const unansweredQuestions = selectedOptions.filter(opt => opt === -1).length;
    
    if (unansweredQuestions > 0 && !confirmSubmit) {
      setConfirmSubmit(true);
      return;
    }
    
    // Extract answers from selectedOptions
    const answers = quiz.questions.map((question, index) => ({
      questionId: question.id,
      selectedOption: selectedOptions[index] !== -1 ? selectedOptions[index] : 0,
    }));
    
    submitQuizAttempt(attempt.id, answers);
    
    toast({
      title: "Quiz Submitted",
      description: "Your quiz has been submitted successfully",
    });
    
    navigate(`/attempt-results/${attempt.id}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{quiz.title}</h1>
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          <span>{formatTime(timeSpent)}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-muted-foreground">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
        <div className="flex items-center gap-2">
          <div className="text-sm text-muted-foreground">
            Progress: {Math.round(progress)}%
          </div>
        </div>
      </div>
      
      <Progress value={progress} className="h-2" />

      {confirmSubmit && (
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            You have {selectedOptions.filter(opt => opt === -1).length} unanswered questions. 
            Are you sure you want to submit your quiz?
          </AlertDescription>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setConfirmSubmit(false)}>
              Cancel
            </Button>
            <Button variant="default" onClick={handleSubmitQuiz}>
              Submit Anyway
            </Button>
          </div>
        </Alert>
      )}

      <Card className="question-card">
        <CardHeader>
          <CardTitle>Question {currentQuestionIndex + 1}</CardTitle>
          <CardDescription className="text-lg font-medium">
            {currentQuestion.text}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                className={`option-button ${
                  selectedOptions[currentQuestionIndex] === index ? "selected" : ""
                }`}
                onClick={() => handleOptionSelect(index)}
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full border border-gray-300 bg-muted">
                    {String.fromCharCode(65 + index)}
                  </div>
                  <span>{option}</span>
                  {selectedOptions[currentQuestionIndex] === index && (
                    <CheckCircle className="ml-auto h-5 w-5" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          {currentQuestionIndex < quiz.questions.length - 1 ? (
            <Button onClick={handleNextQuestion}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={() => setConfirmSubmit(true)}>
              Submit Quiz
              <CheckCircle2 className="h-4 w-4 ml-2" />
            </Button>
          )}
        </CardFooter>
      </Card>

      <div className="grid grid-cols-6 sm:grid-cols-10 gap-2 mt-6">
        {quiz.questions.map((_, index) => (
          <Button
            key={index}
            variant={selectedOptions[index] !== -1 ? "default" : "outline"}
            className="h-10 w-10 p-0"
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default QuizTaker;
