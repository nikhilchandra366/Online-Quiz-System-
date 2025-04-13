
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz } from "@/context/QuizContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, CheckCircle2, XCircle, Home } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const AttemptResults: React.FC = () => {
  const { attemptId } = useParams<{ attemptId: string }>();
  const { attempts, quizzes } = useQuiz();
  const navigate = useNavigate();

  const [attempt, setAttempt] = useState<typeof attempts[0] | null>(null);
  const [quiz, setQuiz] = useState<typeof quizzes[0] | null>(null);

  useEffect(() => {
    if (attemptId) {
      const foundAttempt = attempts.find((a) => a.id === attemptId);
      if (foundAttempt) {
        setAttempt(foundAttempt);
        
        const foundQuiz = quizzes.find((q) => q.id === foundAttempt.quizId);
        if (foundQuiz) {
          setQuiz(foundQuiz);
        }
      }
    }
  }, [attemptId, attempts, quizzes]);

  if (!attempt || !quiz) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading results...</p>
      </div>
    );
  }

  const score = attempt.score || 0;
  const completedAt = new Date(attempt.completedAt || "");

  // Map of questionId to selected answer
  const answerMap: { [key: string]: number } = {};
  attempt.answers.forEach((ans) => {
    answerMap[ans.questionId] = ans.selectedOption;
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreText = (score: number) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/student-dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quiz.title} - Results</h1>
            <p className="text-muted-foreground">
              Completed on {completedAt.toLocaleDateString()}{" "}
              {completedAt.toLocaleTimeString()}
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-4">
          <div className="flex justify-between items-center">
            <CardTitle>Quiz Summary</CardTitle>
            <Badge
              className={`text-lg px-3 py-1 ${
                score >= 60 ? "bg-green-100 text-green-800" : 
                score >= 40 ? "bg-yellow-100 text-yellow-800" : 
                "bg-red-100 text-red-800"
              }`}
            >
              Score: {score}%
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <p className="text-muted-foreground mb-2">Overall Performance</p>
              <Progress value={score} className="h-3" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted rounded-md p-4">
                <p className="text-muted-foreground text-sm">Total Questions</p>
                <p className="text-2xl font-bold">{quiz.questions.length}</p>
              </div>
              <div className="bg-muted rounded-md p-4">
                <p className="text-muted-foreground text-sm">Performance</p>
                <p className={`text-2xl font-bold ${getScoreColor(score)}`}>
                  {getScoreText(score)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={() => navigate("/student-dashboard")}>
            <Home className="h-4 w-4 mr-2" />
            Return to Dashboard
          </Button>
        </CardFooter>
      </Card>

      <h2 className="text-xl font-bold mt-8">Question Analysis</h2>

      {quiz.questions.map((question, index) => {
        const selectedOption = answerMap[question.id] !== undefined
          ? answerMap[question.id]
          : -1;
        
        const isCorrect = selectedOption === question.correctAnswer;

        return (
          <Card
            key={question.id}
            className={`question-card border-l-4 ${
              isCorrect ? "border-l-green-500" : "border-l-red-500"
            }`}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between">
                <CardTitle className="text-lg">Question {index + 1}</CardTitle>
                {isCorrect ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Correct
                  </Badge>
                ) : (
                  <Badge variant="outline" className="bg-red-100 text-red-800 border-red-300">
                    <XCircle className="h-4 w-4 mr-1" />
                    Incorrect
                  </Badge>
                )}
              </div>
              <CardDescription className="text-lg font-medium">
                {question.text}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {question.options.map((option, optIndex) => (
                  <div
                    key={optIndex}
                    className={`p-3 rounded-md border ${
                      selectedOption === optIndex && question.correctAnswer === optIndex
                        ? "bg-green-100 border-green-300"
                        : selectedOption === optIndex
                        ? "bg-red-100 border-red-300"
                        : question.correctAnswer === optIndex
                        ? "bg-green-50 border-green-200"
                        : "bg-muted border-muted-foreground/20"
                    }`}
                  >
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-6 h-6 rounded-full border text-xs font-medium mr-2">
                        {String.fromCharCode(65 + optIndex)}
                      </div>
                      <span>{option}</span>
                      {question.correctAnswer === optIndex && (
                        <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
                      )}
                      {selectedOption === optIndex &&
                        question.correctAnswer !== optIndex && (
                          <XCircle className="ml-auto h-4 w-4 text-red-600" />
                        )}
                    </div>
                  </div>
                ))}
              </div>
              {selectedOption !== question.correctAnswer && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="font-medium">Correct Answer:</p>
                  <p>
                    {String.fromCharCode(65 + question.correctAnswer)}:{" "}
                    {question.options[question.correctAnswer]}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default AttemptResults;
