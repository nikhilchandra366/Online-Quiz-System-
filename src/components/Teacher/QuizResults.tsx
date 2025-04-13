
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuiz } from "@/context/QuizContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, Calendar, CheckCircle2, LineChart, BarChart4 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const QuizResults: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const { quizzes, getQuizAttempts } = useQuiz();
  const navigate = useNavigate();

  const [quiz, setQuiz] = useState<typeof quizzes[0] | null>(null);
  const [attempts, setAttempts] = useState<ReturnType<typeof getQuizAttempts>>([]);
  const [scoreDistribution, setScoreDistribution] = useState<{name: string, count: number}[]>([]);

  useEffect(() => {
    if (quizId) {
      const foundQuiz = quizzes.find(q => q.id === quizId);
      if (foundQuiz) {
        setQuiz(foundQuiz);
        const quizAttempts = getQuizAttempts(quizId);
        // Only include completed attempts
        const completedAttempts = quizAttempts.filter(a => a.completedAt !== null);
        setAttempts(completedAttempts);
        
        // Calculate score distribution
        const distribution = [
          { name: '0-20%', count: 0 },
          { name: '21-40%', count: 0 },
          { name: '41-60%', count: 0 },
          { name: '61-80%', count: 0 },
          { name: '81-100%', count: 0 },
        ];
        
        completedAttempts.forEach(attempt => {
          const score = attempt.score || 0;
          if (score <= 20) distribution[0].count++;
          else if (score <= 40) distribution[1].count++;
          else if (score <= 60) distribution[2].count++;
          else if (score <= 80) distribution[3].count++;
          else distribution[4].count++;
        });
        
        setScoreDistribution(distribution);
      }
    }
  }, [quizId, quizzes, getQuizAttempts]);

  if (!quiz) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Loading quiz results...</p>
      </div>
    );
  }

  const averageScore = attempts.length
    ? Math.round(
        attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / attempts.length
      )
    : 0;

  const questionAnalysis = quiz.questions.map((question, index) => {
    let correctCount = 0;
    let totalAnswered = 0;
    
    attempts.forEach(attempt => {
      const answer = attempt.answers.find(a => a.questionId === question.id);
      if (answer) {
        totalAnswered++;
        if (answer.selectedOption === question.correctAnswer) {
          correctCount++;
        }
      }
    });
    
    const correctPercentage = totalAnswered ? Math.round((correctCount / totalAnswered) * 100) : 0;
    
    return {
      questionNumber: index + 1,
      questionText: question.text,
      correctCount,
      totalAnswered,
      correctPercentage,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => navigate("/teacher-dashboard")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{quiz.title} - Results</h1>
            <p className="text-muted-foreground">
              Analysis of student performance
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quiz Statistics</CardTitle>
          <CardDescription>
            Overview of student performance on this quiz
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-muted rounded-md p-4">
              <div className="flex items-center mb-2">
                <User className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Total Attempts</h3>
              </div>
              <p className="text-3xl font-bold">{attempts.length}</p>
            </div>
            <div className="bg-muted rounded-md p-4">
              <div className="flex items-center mb-2">
                <CheckCircle2 className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Average Score</h3>
              </div>
              <p className="text-3xl font-bold">{averageScore}%</p>
            </div>
            <div className="bg-muted rounded-md p-4">
              <div className="flex items-center mb-2">
                <Calendar className="h-5 w-5 mr-2 text-primary" />
                <h3 className="font-medium">Last Submission</h3>
              </div>
              <p className="text-lg font-medium">
                {attempts.length > 0
                  ? new Date(
                      Math.max(
                        ...attempts.map((a) =>
                          a.completedAt ? new Date(a.completedAt).getTime() : 0
                        )
                      )
                    ).toLocaleDateString()
                  : "No attempts"}
              </p>
            </div>
          </div>

          {attempts.length > 0 && (
            <Tabs defaultValue="overview">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="questions">Question Analysis</TabsTrigger>
                <TabsTrigger value="students">Student Results</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="pt-4">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Score Distribution</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={scoreDistribution}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis allowDecimals={false} />
                          <Tooltip />
                          <Bar
                            dataKey="count"
                            fill="#4f46e5"
                            name="Number of Students"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Performance Summary</h3>
                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Excellent (81-100%)</span>
                          <span>
                            {attempts.filter((a) => (a.score || 0) > 80).length} students
                          </span>
                        </div>
                        <Progress
                          value={
                            (attempts.filter((a) => (a.score || 0) > 80).length /
                              attempts.length) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Good (61-80%)</span>
                          <span>
                            {
                              attempts.filter(
                                (a) => (a.score || 0) > 60 && (a.score || 0) <= 80
                              ).length
                            }{" "}
                            students
                          </span>
                        </div>
                        <Progress
                          value={
                            (attempts.filter(
                              (a) => (a.score || 0) > 60 && (a.score || 0) <= 80
                            ).length /
                              attempts.length) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Average (41-60%)</span>
                          <span>
                            {
                              attempts.filter(
                                (a) => (a.score || 0) > 40 && (a.score || 0) <= 60
                              ).length
                            }{" "}
                            students
                          </span>
                        </div>
                        <Progress
                          value={
                            (attempts.filter(
                              (a) => (a.score || 0) > 40 && (a.score || 0) <= 60
                            ).length /
                              attempts.length) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm">
                          <span>Below Average (0-40%)</span>
                          <span>
                            {
                              attempts.filter(
                                (a) => (a.score || 0) <= 40
                              ).length
                            }{" "}
                            students
                          </span>
                        </div>
                        <Progress
                          value={
                            (attempts.filter(
                              (a) => (a.score || 0) <= 40
                            ).length /
                              attempts.length) *
                            100
                          }
                          className="h-2"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="questions" className="pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Question Performance</h3>
                  
                  {questionAnalysis.map((analysis) => (
                    <Card key={`q-${analysis.questionNumber}`}>
                      <CardContent className="pt-6">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">
                                Question {analysis.questionNumber}
                              </h4>
                              <p className="text-sm text-muted-foreground">
                                {analysis.questionText}
                              </p>
                            </div>
                            <Badge
                              className={
                                analysis.correctPercentage >= 70
                                  ? "bg-green-100 text-green-800"
                                  : analysis.correctPercentage >= 40
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                              }
                            >
                              {analysis.correctPercentage}% Correct
                            </Badge>
                          </div>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-1">
                              <span>
                                {analysis.correctCount} of {analysis.totalAnswered} students answered correctly
                              </span>
                            </div>
                            <Progress value={analysis.correctPercentage} className="h-2" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="students" className="pt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Individual Results</h3>
                  
                  {attempts.length === 0 ? (
                    <p>No student attempts found for this quiz.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-muted">
                            <th className="text-left p-3">Student Name</th>
                            <th className="text-left p-3">Completed</th>
                            <th className="text-left p-3">Score</th>
                            <th className="text-left p-3">Duration</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attempts
                            .sort((a, b) => (b.score || 0) - (a.score || 0))
                            .map((attempt) => {
                              const started = new Date(attempt.startedAt);
                              const completed = new Date(
                                attempt.completedAt || ""
                              );
                              const durationMs = completed.getTime() - started.getTime();
                              const minutes = Math.floor(durationMs / 60000);
                              const seconds = Math.floor((durationMs % 60000) / 1000);
                              
                              return (
                                <tr
                                  key={attempt.id}
                                  className="border-b border-muted-foreground/20"
                                >
                                  <td className="p-3">{attempt.studentName}</td>
                                  <td className="p-3">
                                    {completed.toLocaleDateString()},{" "}
                                    {completed.toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </td>
                                  <td className="p-3">
                                    <Badge
                                      className={
                                        (attempt.score || 0) >= 70
                                          ? "bg-green-100 text-green-800"
                                          : (attempt.score || 0) >= 40
                                          ? "bg-yellow-100 text-yellow-800"
                                          : "bg-red-100 text-red-800"
                                      }
                                    >
                                      {attempt.score}%
                                    </Badge>
                                  </td>
                                  <td className="p-3">
                                    {minutes}m {seconds}s
                                  </td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default QuizResults;
