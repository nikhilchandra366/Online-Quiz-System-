
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Quiz, QuizAttempt } from '@/types/quiz';

interface QuizAnalyticsProps {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
}

const QuizAnalytics: React.FC<QuizAnalyticsProps> = ({ quizzes, attempts }) => {
  // Calculate completion rates
  const completionData = quizzes.map(quiz => {
    const quizAttempts = attempts.filter(a => a.quizId === quiz.id);
    const completedAttempts = quizAttempts.filter(a => a.completedAt);
    const avgScore = completedAttempts.length > 0
      ? completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / completedAttempts.length
      : 0;
    
    return {
      name: quiz.title,
      attempts: quizAttempts.length,
      completed: completedAttempts.length,
      avgScore: Math.round(avgScore)
    };
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Quiz Performance Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ChartContainer 
            config={{
              attempts: { theme: { light: "#9b87f5", dark: "#7E69AB" } },
              completed: { theme: { light: "#33C3F0", dark: "#1EAEDB" } },
              avgScore: { theme: { light: "#6E59A5", dark: "#D6BCFA" } }
            }}
          >
            <BarChart data={completionData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis dataKey="name" />
              <YAxis />
              <ChartTooltip />
              <Bar dataKey="attempts" name="Total Attempts" stackId="a" fill="var(--color-attempts)" />
              <Bar dataKey="completed" name="Completed" stackId="a" fill="var(--color-completed)" />
              <Bar dataKey="avgScore" name="Average Score %" fill="var(--color-avgScore)" />
            </BarChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default QuizAnalytics;
